"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1, "El nombre es obligatorio."),
  height: z.coerce.number().positive("La altura debe ser mayor a 0."),
  weight: z.coerce.number().positive("El peso debe ser mayor a 0."),
  gender: z.enum(["male", "female", "non-binary", "prefer-not-to-say"], {
    errorMap: () => ({ message: "Seleccioná un género válido." }),
  }),
});

export interface UpdatePatientProfileData {
  userId: string;
  name: string;
  height: number;
  weight: number;
  gender: string;
}

export async function updatePatientProfile(data: UpdatePatientProfileData) {
  const parsed = updateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors.map((e) => e.message).join(" ") };
  }

  const { userId, name, height, weight, gender } = parsed.data;

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
