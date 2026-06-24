"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

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
}

export async function updateProfessionalProfile(data: UpdateProfessionalProfileData) {
  const { userId, name, title, bio, location, modality, specialty, price, licenseNumber } = data;

  if (!name) {
    return { success: false, error: "El nombre es obligatorio." };
  }

  try {
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
        },
      }),
    ]);

    revalidatePath("/profesional/dashboard");
    revalidatePath("/profesional/dashboard/perfil");
    revalidatePath("/paciente/dashboard/expertos");
    return { success: true };
  } catch (error) {
    console.error("Update professional profile error:", error);
    return { success: false, error: "No se pudo actualizar el perfil." };
  }
}
