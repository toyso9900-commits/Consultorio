"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function activateSubscription(userId: string, planId: string) {
  if (!userId || !planId) {
    return { success: false, error: "Datos incompletos." };
  }

  try {
    const plan = planId === "pro" ? "PREMIUM" : planId.toUpperCase();

    await prisma.subscription.upsert({
      where: {
        userId_plan: {
          userId,
          plan: plan as "FREE" | "PREMIUM",
        },
      },
      create: {
        userId,
        plan: plan as "FREE" | "PREMIUM",
        status: "ACTIVE",
      },
      update: {
        status: "ACTIVE",
      },
    });

    revalidatePath("/profesional/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Activate subscription error:", error);
    return { success: false, error: "No se pudo activar la suscripción." };
  }
}
