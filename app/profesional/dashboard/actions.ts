"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function validateProfessional(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const profileId = formData.get("profileId") as string;

  try {
    await prisma.professionalProfile.update({
      where: { id: profileId },
      data: { isValidated: true },
    });

    revalidatePath("/profesional/dashboard");
    revalidatePath("/paciente/dashboard/expertos");
    return { success: true };
  } catch (error) {
    console.error("Validate professional error:", error);
    return { success: false, error: "No se pudo validar al profesional." };
  }
}

export async function rejectProfessional(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const profileId = formData.get("profileId") as string;

  try {
    await prisma.professionalProfile.delete({
      where: { id: profileId },
    });

    revalidatePath("/profesional/dashboard");
    revalidatePath("/paciente/dashboard/expertos");
    return { success: true };
  } catch (error) {
    console.error("Reject professional error:", error);
    return { success: false, error: "No se pudo rechazar al profesional." };
  }
}
