"use server";

import { prisma } from "@/lib/prisma";

export interface WeightHistoryPoint {
  recordedAt: Date;
  weight: number;
}

export async function recordWeight(
  patientProfileId: string,
  weight: number,
  notes?: string
): Promise<void> {
  await prisma.weightEntry.create({
    data: {
      patientProfileId,
      weight,
      notes,
    },
  });
}

export async function getWeightHistory(
  patientProfileId: string
): Promise<WeightHistoryPoint[]> {
  const entries = await prisma.weightEntry.findMany({
    where: { patientProfileId },
    orderBy: { recordedAt: "asc" },
    select: {
      recordedAt: true,
      weight: true,
    },
  });

  return entries;
}
