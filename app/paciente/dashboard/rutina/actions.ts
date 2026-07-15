"use server";

import { revalidatePath } from "next/cache";
import { RoutineItemType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActivePatientSubscription } from "@/lib/patient-subscriptions";
import { dateOnlyUtc, localDateString } from "@/lib/day-boundaries";
import { WATER_STEP_ML } from "@/lib/routine-items";

/**
 * Patient daily-tracker mutations (DPT-002, DPT-003, DPT-004).
 *
 * Every mutation re-derives authorization from the session: the item's
 * routine must belong to the session patient AND the patient must hold an
 * active subscription with that routine's professional. The completion key
 * is (itemId, patientId, user-local date) — lazy reset means a new local
 * day simply has no row.
 */

type TrackResult =
  | { success: true; count: number }
  | { success: false; error: string };

/**
 * Shared guard: session PATIENT + item ownership (the routine's patientId
 * is the session user) + active subscription with the authoring
 * professional. Returns the item and the patient's local today, or null
 * when any check fails.
 */
async function authorizeItemAccess(itemId: string) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "PATIENT") {
    return null;
  }

  const patientId = session.user.id;

  const item = await prisma.routineItem.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      type: true,
      goal: true,
      routine: { select: { patientId: true, professionalId: true } },
    },
  });

  if (!item || item.routine.patientId !== patientId) {
    return null;
  }

  const subscribed = await hasActivePatientSubscription(
    patientId,
    item.routine.professionalId
  );

  if (!subscribed) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: patientId },
    select: { timezone: true },
  });

  const today = dateOnlyUtc(localDateString(new Date(), user?.timezone ?? null));

  return { item, patientId, today };
}

/** CHECK item tap: flips today's count between 0 and 1 (DPT-002). */
export async function toggleCheckItem(itemId: string): Promise<TrackResult> {
  const ctx = await authorizeItemAccess(itemId);

  if (!ctx) {
    return { success: false, error: "Unauthorized." };
  }

  if (ctx.item.type !== RoutineItemType.CHECK) {
    return { success: false, error: "Invalid item." };
  }

  try {
    const existing = await prisma.routineItemCompletion.findUnique({
      where: {
        itemId_patientId_date: {
          itemId,
          patientId: ctx.patientId,
          date: ctx.today,
        },
      },
      select: { count: true },
    });

    const nextCount = existing && existing.count >= 1 ? 0 : 1;

    await prisma.routineItemCompletion.upsert({
      where: {
        itemId_patientId_date: {
          itemId,
          patientId: ctx.patientId,
          date: ctx.today,
        },
      },
      create: {
        itemId,
        patientId: ctx.patientId,
        date: ctx.today,
        count: nextCount,
        completedAt: nextCount === 1 ? new Date() : null,
      },
      update: {
        count: nextCount,
        completedAt: nextCount === 1 ? new Date() : null,
      },
    });

    revalidatePath("/paciente/dashboard/rutina");
    return { success: true, count: nextCount };
  } catch {
    return { success: false, error: "Could not save the item." };
  }
}

/**
 * WATER item quick-add: ±WATER_STEP_ML, clamped to [0, goal] (DPT-003).
 * Habit tracking, not surveillance — decrement is always available.
 */
export async function adjustWaterItem(
  itemId: string,
  delta: number
): Promise<TrackResult> {
  const ctx = await authorizeItemAccess(itemId);

  if (!ctx) {
    return { success: false, error: "Unauthorized." };
  }

  if (ctx.item.type !== RoutineItemType.WATER || ctx.item.goal == null) {
    return { success: false, error: "Invalid item." };
  }

  if (delta !== WATER_STEP_ML && delta !== -WATER_STEP_ML) {
    return { success: false, error: "Invalid step." };
  }

  const goal = ctx.item.goal;

  try {
    const existing = await prisma.routineItemCompletion.findUnique({
      where: {
        itemId_patientId_date: {
          itemId,
          patientId: ctx.patientId,
          date: ctx.today,
        },
      },
      select: { count: true },
    });

    const nextCount = Math.min(Math.max((existing?.count ?? 0) + delta, 0), goal);

    await prisma.routineItemCompletion.upsert({
      where: {
        itemId_patientId_date: {
          itemId,
          patientId: ctx.patientId,
          date: ctx.today,
        },
      },
      create: {
        itemId,
        patientId: ctx.patientId,
        date: ctx.today,
        count: nextCount,
        completedAt: nextCount >= goal ? new Date() : null,
      },
      update: {
        count: nextCount,
        completedAt: nextCount >= goal ? new Date() : null,
      },
    });

    revalidatePath("/paciente/dashboard/rutina");
    return { success: true, count: nextCount };
  } catch {
    return { success: false, error: "Could not save the item." };
  }
}

/**
 * Persist-once timezone auto-detect (DPT-004): the browser's IANA zone is
 * stored ONLY when User.timezone is still null, so a manual profile choice
 * is never overwritten. Invalid zones are rejected via Intl validation.
 */
export async function saveDetectedTimezone(
  tz: string
): Promise<{ success: boolean }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false };
  }

  try {
    // Intl throws RangeError for non-IANA zones.
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
  } catch {
    return { success: false };
  }

  try {
    await prisma.user.updateMany({
      where: { id: session.user.id, timezone: null },
      data: { timezone: tz },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}
