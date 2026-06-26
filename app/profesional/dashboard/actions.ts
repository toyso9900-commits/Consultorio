"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { triggerAdminUpdate } from "@/lib/pusher-server";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

export async function validateProfessional(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const profileId = formData.get("profileId") as string;

  try {
    await requireAdmin();

    const profile = await prisma.professionalProfile.update({
      where: { id: profileId },
      data: { isValidated: true, rejectedAt: null },
    });

    revalidatePath("/profesional/dashboard");
    revalidatePath("/profesional/dashboard/usuarios");
    revalidatePath("/paciente/dashboard/expertos");

    triggerAdminUpdate({
      type: "professional-validated",
      userId: profile.userId,
      profileId: profile.id,
    }).catch((err) => console.error("Pusher trigger error:", err));

    return { success: true };
  } catch (error) {
    console.error("Validate professional error:", error);
    return { success: false, error: "No se pudo validar al profesional." };
  }
}

export async function rejectProfessional(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const profileId = formData.get("profileId") as string;

  try {
    await requireAdmin();

    const profile = await prisma.professionalProfile.update({
      where: { id: profileId },
      data: { isValidated: false, rejectedAt: new Date() },
    });

    revalidatePath("/profesional/dashboard");
    revalidatePath("/profesional/dashboard/usuarios");
    revalidatePath("/paciente/dashboard/expertos");

    triggerAdminUpdate({
      type: "professional-rejected",
      userId: profile.userId,
      profileId: profile.id,
    }).catch((err) => console.error("Pusher trigger error:", err));

    return { success: true };
  } catch (error) {
    console.error("Reject professional error:", error);
    return { success: false, error: "No se pudo rechazar al profesional." };
  }
}
