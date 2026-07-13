"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActivePatientSubscription } from "@/lib/patient-subscriptions";
import { triggerRoutinePublished } from "@/lib/pusher-server";

export async function publishRoutineForPatient(
  patientId: string,
  title: string,
  content: string
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

    // One row per pair — upsert replaces the previous version in place.
    const routine = await prisma.routine.upsert({
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
