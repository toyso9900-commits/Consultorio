"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { triggerAdminUpdate } from "@/lib/pusher-server";

export async function getAllUsers(): Promise<
  | { success: true; users: { id: string; name: string | null; email: string | null; role: string; createdAt: Date; patientProfile: { id: string } | null; professionalProfile: { id: string; isValidated: boolean } | null; subscriptions: { id: string; status: string; plan: string }[] }[] }
  | { success: false; error: string }
> {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { role: { not: "PROFESSIONAL" } },
          { professionalProfile: { rejectedAt: null } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        patientProfile: true,
        professionalProfile: true,
        subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return { success: true, users };
  } catch (error) {
    console.error("Get all users error:", error);
    return { success: false, error: "No se pudieron cargar los usuarios." };
  }
}

export async function deleteUser(userId: string) {
  if (!userId) {
    return { success: false, error: "ID de usuario requerido." };
  }

  try {
    await prisma.user.delete({ where: { id: userId } });

    revalidatePath("/profesional/dashboard/usuarios");
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: "No se pudo eliminar el usuario." };
  }
}

export async function toggleUserValidation(profileId: string, isValidated: boolean) {
  if (!profileId) {
    return { success: false, error: "ID de perfil requerido." };
  }

  try {
    const profile = await prisma.professionalProfile.update({
      where: { id: profileId },
      data: { isValidated, rejectedAt: isValidated ? null : undefined },
    });

    revalidatePath("/profesional/dashboard/usuarios");
    revalidatePath("/profesional/dashboard");
    revalidatePath("/paciente/dashboard/expertos");

    const eventType = isValidated ? "professional-validated" : "professional-rejected";
    triggerAdminUpdate({
      type: eventType,
      userId: profile.userId,
      profileId: profile.id,
    }).catch((err) => console.error("Pusher trigger error:", err));

    return { success: true };
  } catch (error) {
    console.error("Toggle validation error:", error);
    return { success: false, error: "No se pudo actualizar el estado." };
  }
}
