"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

export interface RatingSummary {
  average: number;
  count: number;
}

export type ReviewErrorCode =
  | "ALREADY_REVIEWED"
  | "APPOINTMENT_NOT_COMPLETED"
  | "UNAUTHORIZED"
  | "INVALID_SCORE"
  | "NOT_FOUND";

export type SubmitReviewResult =
  | { success: true }
  | { success: false; error: ReviewErrorCode };

const submitReviewSchema = z.object({
  appointmentId: z.string().min(1),
  patientId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export async function getProfessionalRating(
  professionalId: string
): Promise<RatingSummary> {
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: professionalId },
    select: { averageRating: true, reviewCount: true },
  });

  if (!profile) {
    return { average: 0, count: 0 };
  }

  return {
    average: Math.round(profile.averageRating * 10) / 10,
    count: profile.reviewCount,
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
): Promise<SubmitReviewResult> {
  const parsed = submitReviewSchema.safeParse({
    appointmentId,
    patientId,
    rating,
    comment,
  });

  if (!parsed.success) {
    return { success: false, error: "INVALID_SCORE" };
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: parsed.data.appointmentId },
    include: { review: true },
  });

  if (!appointment) {
    return { success: false, error: "NOT_FOUND" };
  }

  if (appointment.patientId !== parsed.data.patientId) {
    return { success: false, error: "UNAUTHORIZED" };
  }

  if (appointment.status !== "COMPLETED") {
    return { success: false, error: "APPOINTMENT_NOT_COMPLETED" };
  }

  if (appointment.review) {
    return { success: false, error: "ALREADY_REVIEWED" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        appointmentId: parsed.data.appointmentId,
        patientId: parsed.data.patientId,
        professionalId: appointment.professionalId,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
    });

    const reviews = await tx.review.findMany({
      where: { professionalId: appointment.professionalId },
      select: { rating: true },
    });

    const count = reviews.length;
    const average =
      count === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / count;

    await tx.professionalProfile.update({
      where: { userId: appointment.professionalId },
      data: {
        averageRating: Math.round(average * 10) / 10,
        reviewCount: count,
      },
    });
  });

  return { success: true };
}

export async function getReviewsForViewer(
  viewerId: string,
  role: "ADMIN" | "PROFESSIONAL"
): Promise<
  {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    patient: { name: string | null; image: string | null };
    professional: { name: string | null; image: string | null };
  }[]
> {
  const where =
    role === "ADMIN" ? undefined : { professionalId: viewerId };

  const reviews = await prisma.review.findMany({
    where,
    include: {
      patient: {
        select: { name: true, image: true },
      },
      professional: {
        select: { name: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    patient: review.patient,
    professional: review.professional,
  }));
}
