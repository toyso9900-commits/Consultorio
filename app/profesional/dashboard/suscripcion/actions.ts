"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function activateSubscription(userId: string, planId: string) {
  if (!userId || !planId) {
    return { success: false, error: "Datos incompletos." };
  }

  try {
    const plan = planId === "pro" ? "PRO" : planId.toUpperCase();

    if (plan !== "FREE" && plan !== "PREMIUM" && plan !== "PRO") {
      return { success: false, error: "Plan no válido." };
    }

    const isPaid = plan === "PREMIUM" || plan === "PRO";
    const expiresAt = isPaid
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : null;

    await prisma.$transaction(async (tx) => {
      await tx.subscription.upsert({
        where: {
          userId_plan: {
            userId,
            plan: plan as "FREE" | "PREMIUM" | "PRO",
          },
        },
        create: {
          userId,
          plan: plan as "FREE" | "PREMIUM" | "PRO",
          status: "ACTIVE",
          expiresAt,
        },
        update: {
          status: "ACTIVE",
          expiresAt,
        },
      });

      await tx.professionalProfile.updateMany({
        where: { userId },
        data: { isPremium: isPaid },
      });
    });

    revalidatePath("/profesional/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "No se pudo activar la suscripción." };
  }
}
