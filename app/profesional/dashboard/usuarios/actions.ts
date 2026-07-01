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

export async function getAllUsers(): Promise<
  | { success: true; users: { id: string; name: string | null; email: string | null; role: string; createdAt: Date; patientProfile: { id: string } | null; professionalProfile: { id: string; isValidated: boolean } | null; subscriptions: { id: string; status: string; plan: string }[] }[] }
  | { success: false; error: string }
> {
  try {
    await requireAdmin();

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
  } catch {
    return { success: false, error: "No se pudieron cargar los usuarios." };
  }
}

export async function deleteUser(userId: string) {
  if (!userId) {
    return { success: false, error: "ID de usuario requerido." };
  }

  try {
    await requireAdmin();

    await prisma.user.delete({ where: { id: userId } });

    revalidatePath("/profesional/dashboard/usuarios");
    return { success: true };
  } catch {
    return { success: false, error: "No se pudo eliminar el usuario." };
  }
}

export async function toggleUserValidation(profileId: string, isValidated: boolean) {
  if (!profileId) {
    return { success: false, error: "ID de perfil requerido." };
  }

  try {
    await requireAdmin();

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
    }).catch(() => {});

    return { success: true };
  } catch {
    return { success: false, error: "No se pudo actualizar el estado." };
  }
}
