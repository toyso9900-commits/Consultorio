"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function validateProfessional(formData: FormData): Promise<void> {
  const profileId = formData.get("profileId") as string;

  try {
    await prisma.professionalProfile.update({
      where: { id: profileId },
      data: { isValidated: true },
    });

    revalidatePath("/profesional/dashboard");
  } catch (error) {
    console.error("Validate professional error:", error);
    throw new Error("No se pudo validar al profesional.");
  }
}

export async function rejectProfessional(formData: FormData): Promise<void> {
  const profileId = formData.get("profileId") as string;

  try {
    // Delete the professional profile first because of the foreign key.
    await prisma.professionalProfile.delete({
      where: { id: profileId },
    });

    revalidatePath("/profesional/dashboard");
  } catch (error) {
    console.error("Reject professional error:", error);
    throw new Error("No se pudo rechazar al profesional.");
  }
}
