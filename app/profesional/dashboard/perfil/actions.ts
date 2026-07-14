"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  title: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  modality: z.enum(["ONLINE", "IN_PERSON", "BOTH"]).optional(),
  specialty: z.enum(["NUTRITION", "TRAINING", "BOTH"]).optional(),
  licenseNumber: z.string().optional(),
  planPrice: z.number().positive().nullable().optional(),
  planDuration: z.string().max(120).nullable().optional(),
});

export interface UpdateProfessionalProfileData {
  name: string;
  title?: string;
  bio?: string;
  location?: string;
  modality?: "ONLINE" | "IN_PERSON" | "BOTH";
  specialty?: "NUTRITION" | "TRAINING" | "BOTH";
  licenseNumber?: string;
  planPrice?: number | null;
  planDuration?: string | null;
}

const freePlanSchema = z.object({
  freePlanTitle: z.string().max(120).nullable().optional(),
  freePlanContent: z.string().max(5000).nullable().optional(),
});

export interface UpdateFreePlanData {
  freePlanTitle?: string | null;
  freePlanContent?: string | null;
}

function toNullableString(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export async function updateProfessionalProfile(data: UpdateProfessionalProfileData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PROFESSIONAL") {
    return { success: false, error: "No autorizado." };
  }
  const userId = session.user.id;

  const parsed = updateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors.map((e) => e.message).join(" ") };
  }

  const { name, title, bio, location, modality, specialty, licenseNumber, planPrice, planDuration } = parsed.data;

  try {
    const profile = await prisma.professionalProfile.findUnique({ where: { userId } });
    if (!profile) {
      return { success: false, error: "No se encontró el perfil profesional." };
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { name },
      }),
      prisma.professionalProfile.update({
        where: { userId },
        data: {
          title,
          bio,
          location,
          modality,
          specialty,
          licenseNumber,
          planPrice,
          planDuration,
        },
      }),
    ]);

    revalidatePath("/profesional/dashboard");
    revalidatePath("/profesional/dashboard/perfil");
    revalidatePath("/paciente/dashboard/expertos");
    revalidatePath(`/profesional/${userId}`);
    return { success: true };
  } catch {
    return { success: false, error: "No se pudo actualizar el perfil." };
  }
}

export async function updateFreePlan(data: UpdateFreePlanData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PROFESSIONAL") {
    return { success: false, error: "No autorizado." };
  }
  const userId = session.user.id;

  const parsed = freePlanSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors.map((e) => e.message).join(" ") };
  }

  const { freePlanTitle, freePlanContent } = parsed.data;

  try {
    const profile = await prisma.professionalProfile.findUnique({ where: { userId } });
    if (!profile) {
      return { success: false, error: "No se encontró el perfil profesional." };
    }

    await prisma.professionalProfile.update({
      where: { userId },
      data: {
        freePlanTitle: toNullableString(freePlanTitle),
        freePlanContent: toNullableString(freePlanContent),
      },
    });

    revalidatePath("/profesional/dashboard/perfil");
    revalidatePath(`/profesional/${userId}`);
    return { success: true };
  } catch {
    return { success: false, error: "No se pudo actualizar el plan gratuito." };
  }
}
