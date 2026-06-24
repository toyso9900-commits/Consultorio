"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export interface UpdatePatientProfileData {
  userId: string;
  name: string;
  height: number;
  weight: number;
  gender: string;
}

export async function updatePatientProfile(data: UpdatePatientProfileData) {
  const { userId, name, height, weight, gender } = data;

  if (!name || !height || !weight || !gender) {
    return { success: false, error: "Todos los campos son obligatorios." };
  }

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { name },
      }),
      prisma.patientProfile.upsert({
        where: { userId },
        create: { userId, height, weight, gender },
        update: { height, weight, gender },
      }),
    ]);

    revalidatePath("/paciente/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update patient profile error:", error);
    return { success: false, error: "No se pudo actualizar el perfil." };
  }
}
