"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1, "El nombre es obligatorio."),
  title: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  modality: z.enum(["ONLINE", "IN_PERSON", "BOTH"]).optional(),
  specialty: z.enum(["NUTRITION", "TRAINING", "BOTH"]).optional(),
  price: z.number().nonnegative().optional(),
  licenseNumber: z.string().optional(),
  planPrice: z.number().positive().nullable().optional(),
  planDuration: z.string().max(120).nullable().optional(),
});

export interface UpdateProfessionalProfileData {
  userId: string;
  name: string;
  title?: string;
  bio?: string;
  location?: string;
  modality?: "ONLINE" | "IN_PERSON" | "BOTH";
  specialty?: "NUTRITION" | "TRAINING" | "BOTH";
  price?: number;
  licenseNumber?: string;
  planPrice?: number | null;
  planDuration?: string | null;
}

export async function updateProfessionalProfile(data: UpdateProfessionalProfileData) {
  const parsed = updateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors.map((e) => e.message).join(" ") };
  }

  const { userId, name, title, bio, location, modality, specialty, price, licenseNumber, planPrice, planDuration } = parsed.data;

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
          price,
          licenseNumber,
          planPrice,
          planDuration,
        },
      }),
    ]);

    revalidatePath("/profesional/dashboard");
    revalidatePath("/profesional/dashboard/perfil");
    revalidatePath("/paciente/dashboard/expertos");
    return { success: true };
  } catch {
    return { success: false, error: "No se pudo actualizar el perfil." };
  }
}
