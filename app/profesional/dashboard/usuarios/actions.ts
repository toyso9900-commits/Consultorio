"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getAllUsers(): Promise<
  | { success: true; users: { id: string; name: string | null; email: string | null; role: string; createdAt: Date; patientProfile: { id: string } | null; professionalProfile: { id: string; isValidated: boolean } | null; subscriptions: { id: string; status: string; plan: string }[] }[] }
  | { success: false; error: string }
> {
  try {
    const users = await prisma.user.findMany({
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
    await prisma.professionalProfile.update({
      where: { id: profileId },
      data: { isValidated },
    });

    revalidatePath("/profesional/dashboard/usuarios");
    revalidatePath("/paciente/dashboard/expertos");
    return { success: true };
  } catch (error) {
    console.error("Toggle validation error:", error);
    return { success: false, error: "No se pudo actualizar el estado." };
  }
}
