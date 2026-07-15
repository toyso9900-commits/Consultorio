"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActivePatientSubscription } from "@/lib/patient-subscriptions";
import { triggerRoutinePublished } from "@/lib/pusher-server";
import {
  routineItemsPayloadSchema,
  type RoutineItemInput,
} from "@/lib/routine-items";
import type { Prisma } from "@prisma/client";

export async function publishRoutineForPatient(
  patientId: string,
  title: string,
  content: string,
  // Full desired plan-item list (REQ-006). undefined = leave items untouched
  // (legacy callers); [] = delete all items.
  items?: unknown
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "PROFESSIONAL") {
    return { success: false, error: "Unauthorized." };
  }

  if (!patientId) {
    return { success: false, error: "Missing patient." };
  }

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();

  if (!trimmedTitle || !trimmedContent) {
    return { success: false, error: "Title and content are required." };
  }

  // Validate plan items before touching the DB (REQ-006).
  let parsedItems: RoutineItemInput[] | undefined;
  if (items !== undefined) {
    const parsed = routineItemsPayloadSchema.safeParse(items);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid plan items.",
        errorCode: "invalid-items" as const,
      };
    }
    parsedItems = parsed.data;
  }

  const professionalId = session.user.id;

  try {
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, role: true },
    });

    if (!patient || patient.role !== "PATIENT") {
      return { success: false, error: "Patient not found." };
    }

    // Gate: ACTIVE or CANCELLED-but-not-expired subscription with this
    // professional (lazy-expiry predicate — see lib/patient-subscriptions).
    const subscribed = await hasActivePatientSubscription(
      patientId,
      professionalId
    );

    if (!subscribed) {
      return {
        success: false,
        error: "Patient is not subscribed.",
        errorCode: "not-subscribed" as const,
      };
    }

    // One aggregate, one transaction (design): upsert the routine row for
    // this pair — the (patientId, professionalId) key is the ownership
    // check, so another professional's routine is never touched — then
    // reconcile its items by id.
    const routine = await prisma.$transaction(async (tx) => {
      const upserted = await tx.routine.upsert({
        where: { patientId_professionalId: { patientId, professionalId } },
        create: {
          patientId,
          professionalId,
          title: trimmedTitle,
          content: trimmedContent,
        },
        update: {
          title: trimmedTitle,
          content: trimmedContent,
        },
      });

      if (parsedItems !== undefined) {
        await reconcileRoutineItems(tx, upserted.id, parsedItems);
      }

      return upserted;
    });

    revalidatePath("/profesional/dashboard/rutinas");
    revalidatePath("/paciente/dashboard/rutina");

    await triggerRoutinePublished({
      patientId,
      professionalId,
      professionalName: session.user.name ?? null,
      title: routine.title,
    });

    return { success: true };
  } catch {
    return { success: false, error: "Could not save the routine." };
  }
}

/**
 * Reconcile-by-id (DPT-009, REQ-002 MOD): payload ids matching existing
 * items are kept and updated, unknown ids are created, and existing items
 * absent from the payload are deleted — cascading their completions.
 * `sortOrder` is the payload index. Ids belonging to other routines never
 * appear in `existingIds`, so a forged payload degrades to plain creates
 * on this routine instead of mutating someone else's items.
 */
async function reconcileRoutineItems(
  tx: Prisma.TransactionClient,
  routineId: string,
  items: RoutineItemInput[]
): Promise<void> {
  const existing = await tx.routineItem.findMany({
    where: { routineId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((item) => item.id));

  const keptIds = items
    .filter((item) => item.id !== undefined && existingIds.has(item.id))
    .map((item) => item.id as string);

  await tx.routineItem.deleteMany({
    where: { routineId, id: { notIn: keptIds } },
  });

  for (const [index, item] of items.entries()) {
    const data = {
      type: item.type,
      title: item.title,
      icon: item.icon,
      goal: item.goal ?? null,
      sortOrder: index,
    };

    if (item.id !== undefined && existingIds.has(item.id)) {
      await tx.routineItem.update({ where: { id: item.id }, data });
    } else {
      await tx.routineItem.create({ data: { ...data, routineId } });
    }
  }
}
