"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { triggerAppointmentCreated } from "@/lib/pusher-server";

const requestSchema = z.object({
  professionalId: z.string().min(1),
  scheduledAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "La fecha y hora no son válidas.",
  }),
  notes: z.string().max(500, "El motivo no puede superar los 500 caracteres.").optional(),
});

export type RequestAppointmentResult =
  | { success: true }
  | { success: false; error: string };

export async function requestAppointment(
  data: {
    professionalId: string;
    scheduledAt: string;
    notes?: string;
  }
): Promise<RequestAppointmentResult> {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "PATIENT") {
    return { success: false, error: "No autorizado" };
  }

  const parsed = requestSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos inválidos.",
    };
  }

  const { professionalId, scheduledAt, notes } = parsed.data;
  const appointmentDate = new Date(scheduledAt);

  if (appointmentDate.getTime() <= Date.now()) {
    return { success: false, error: "La fecha y hora deben ser futuras." };
  }

  try {
    const professional = await prisma.professionalProfile.findFirst({
      where: { userId: professionalId, isValidated: true },
    });

    if (!professional) {
      return { success: false, error: "El profesional no está disponible." };
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: session.user.id,
        professionalId,
        scheduledAt: appointmentDate,
        status: AppointmentStatus.REQUESTED,
        notes,
      },
    });

    revalidatePath("/paciente/dashboard/citas");
    revalidatePath("/paciente/dashboard");
    revalidatePath("/profesional/dashboard/citas");
    revalidatePath("/profesional/dashboard");

    triggerAppointmentCreated({
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      professionalId: appointment.professionalId,
      status: appointment.status,
      scheduledAt: appointment.scheduledAt.toISOString(),
    }).catch(() => {});

    return { success: true };
  } catch {
    return {
      success: false,
      error: "No se pudo solicitar el turno. Intentá de nuevo.",
    };
  }
}
