"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { isValidTransition } from "@/lib/appointments-status";
import { triggerAppointmentUpdated } from "@/lib/pusher-server";

export type AppointmentActionResult =
  | { success: true }
  | { success: false; error: string };

async function requireProfessional(): Promise<{ userId: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PROFESSIONAL") {
    throw new Error("No autorizado");
  }
  return { userId: session.user.id };
}

async function transitionAppointment(
  appointmentId: string,
  from: AppointmentStatus,
  to: AppointmentStatus
): Promise<AppointmentActionResult> {
  try {
    const { userId } = await requireProfessional();

    if (!isValidTransition(from, to)) {
      return { success: false, error: "invalidTransition" };
    }

    const updated = await prisma.appointment.updateMany({
      where: {
        id: appointmentId,
        professionalId: userId,
        status: from,
      },
      data: { status: to },
    });

    if (updated.count === 0) {
      return { success: false, error: "unauthorized" };
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    revalidatePath("/profesional/dashboard/citas");
    revalidatePath("/profesional/dashboard");

    if (to !== AppointmentStatus.REQUESTED) {
      revalidatePath("/paciente/dashboard/citas");
      revalidatePath("/paciente/dashboard");
    }

    if (appointment) {
      triggerAppointmentUpdated({
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        professionalId: appointment.professionalId,
        status: appointment.status,
        scheduledAt: appointment.scheduledAt.toISOString(),
      }).catch(() => {});
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: "No se pudo actualizar el turno. Intentá de nuevo.",
    };
  }
}

export async function acceptAppointment(
  appointmentId: string
): Promise<AppointmentActionResult> {
  return transitionAppointment(
    appointmentId,
    AppointmentStatus.REQUESTED,
    AppointmentStatus.CONFIRMED
  );
}

export async function rejectAppointment(
  appointmentId: string
): Promise<AppointmentActionResult> {
  return transitionAppointment(
    appointmentId,
    AppointmentStatus.REQUESTED,
    AppointmentStatus.CANCELLED
  );
}

export async function cancelAppointment(
  appointmentId: string
): Promise<AppointmentActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "unauthorized" };
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return { success: false, error: "unauthorized" };
    }

    const isParticipant =
      appointment.professionalId === session.user.id ||
      appointment.patientId === session.user.id;

    if (!isParticipant) {
      return { success: false, error: "unauthorized" };
    }

    if (
      appointment.status !== AppointmentStatus.REQUESTED &&
      appointment.status !== AppointmentStatus.CONFIRMED
    ) {
      return { success: false, error: "invalidTransition" };
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CANCELLED },
    });

    revalidatePath("/profesional/dashboard/citas");
    revalidatePath("/profesional/dashboard");
    revalidatePath("/paciente/dashboard/citas");
    revalidatePath("/paciente/dashboard");

    triggerAppointmentUpdated({
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      professionalId: appointment.professionalId,
      status: AppointmentStatus.CANCELLED,
      scheduledAt: appointment.scheduledAt.toISOString(),
    }).catch(() => {});

    return { success: true };
  } catch {
    return {
      success: false,
      error: "No se pudo cancelar el turno. Intentá de nuevo.",
    };
  }
}

export async function completeAppointment(
  appointmentId: string
): Promise<AppointmentActionResult> {
  return transitionAppointment(
    appointmentId,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.COMPLETED
  );
}
