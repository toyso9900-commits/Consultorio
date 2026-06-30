"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recordWeight } from "@/lib/weight";

const onboardingSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  gender: z.enum(["male", "female", "non-binary", "prefer-not-to-say"], {
    message: "Seleccioná una opción válida.",
  }),
  height: z.coerce
    .number()
    .min(50, "La estatura mínima es 50 cm.")
    .max(300, "La estatura máxima es 300 cm."),
  weight: z.coerce
    .number()
    .min(20, "El peso mínimo es 20 kg.")
    .max(500, "El peso máximo es 500 kg."),
});

export type SaveOnboardingResult =
  | { success: true }
  | { success: false; error: string };

export async function savePatientOnboarding(
  userId: string,
  data: {
    name: string;
    gender: string;
    height: number;
    weight: number;
  }
): Promise<SaveOnboardingResult> {
  const parsed = onboardingSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos inválidos.",
    };
  }

  const { name, gender, height, weight } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { name },
      });
      await tx.patientProfile.upsert({
        where: { userId },
        create: {
          userId,
          gender,
          height,
          weight,
        },
        update: {
          gender,
          height,
          weight,
        },
      });
    });

    const profile = await prisma.patientProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (profile) {
      await recordWeight(profile.id, weight);
    }

    revalidatePath("/paciente/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Onboarding error:", error);
    return {
      success: false,
      error: "Ocurrió un error al guardar tu perfil. Intentá de nuevo.",
    };
  }
}
