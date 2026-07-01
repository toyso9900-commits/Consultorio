"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

export interface RatingSummary {
  average: number;
  count: number;
}

const submitReviewSchema = z.object({
  appointmentId: z.string().min(1),
  patientId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export async function getProfessionalRating(
  professionalId: string
): Promise<RatingSummary> {
  const reviews = await prisma.review.findMany({
    where: { professionalId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    return { average: 0, count: 0 };
  }

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average = sum / reviews.length;

  return {
    average: Math.round(average * 10) / 10,
    count: reviews.length,
  };
}

export async function getPendingReviewsForPatient(
  patientId: string
): Promise<
  {
    id: string;
    scheduledAt: Date;
    professional: { id: string; name: string | null; image: string | null };
  }[]
> {
  const appointments = await prisma.appointment.findMany({
    where: {
      patientId,
      status: "COMPLETED",
      review: { is: null },
    },
    include: {
      professional: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { scheduledAt: "desc" },
  });

  return appointments.map((appointment) => ({
    id: appointment.id,
    scheduledAt: appointment.scheduledAt,
    professional: appointment.professional,
  }));
}

export async function submitReview(
  appointmentId: string,
  patientId: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  const parsed = submitReviewSchema.safeParse({
    appointmentId,
    patientId,
    rating,
    comment,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: parsed.data.appointmentId },
      include: { review: true },
    });

    if (!appointment) {
      return { success: false, error: "appointmentNotFound" };
    }

    if (appointment.patientId !== parsed.data.patientId) {
      return { success: false, error: "unauthorized" };
    }

    if (appointment.status !== "COMPLETED") {
      return { success: false, error: "appointmentNotCompleted" };
    }

    if (appointment.review) {
      return { success: false, error: "reviewAlreadyExists" };
    }

    await prisma.review.create({
      data: {
        appointmentId: parsed.data.appointmentId,
        patientId: parsed.data.patientId,
        professionalId: appointment.professionalId,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: "submitFailed" };
  }
}
