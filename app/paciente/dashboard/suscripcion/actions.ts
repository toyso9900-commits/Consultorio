"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActivePatientSubscription } from "@/lib/patient-subscriptions";
import { paymentProvider } from "@/lib/payments";
import {
  triggerPatientSubscribed,
  triggerSubscriptionCancelled,
} from "@/lib/pusher-server";

const SUBSCRIPTION_PERIOD_DAYS = 30;

export async function subscribePatientToProfessional(professionalId: string) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "PATIENT") {
    return { success: false, error: "Unauthorized." };
  }

  if (!professionalId) {
    return { success: false, error: "Missing professional." };
  }

  const patientId = session.user.id;

  try {
    const professional = await prisma.user.findUnique({
      where: { id: professionalId },
      select: {
        id: true,
        role: true,
        professionalProfile: {
          select: { isValidated: true, planPrice: true },
        },
      },
    });

    if (
      !professional ||
      professional.role !== "PROFESSIONAL" ||
      !professional.professionalProfile?.isValidated
    ) {
      return { success: false, error: "Professional not available." };
    }

    const planPrice = professional.professionalProfile.planPrice;
    if (planPrice == null || planPrice <= 0) {
      return { success: false, error: "Plan price is not configured." };
    }

    // Anti double-subscribe: CANCELLED-but-not-expired still counts as active.
    const alreadyActive = await hasActivePatientSubscription(
      patientId,
      professionalId
    );
    if (alreadyActive) {
      return { success: false, error: "Already subscribed." };
    }

    const charge = await paymentProvider.charge({
      payerId: patientId,
      payeeId: professionalId,
      amount: planPrice,
      currency: "MXN",
    });

    if (charge.status !== "PAID") {
      return {
        success: false,
        error: charge.errorMessage ?? "Payment failed.",
      };
    }

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60 * 1000
    );

    await prisma.$transaction(async (tx) => {
      const subscription = await tx.patientSubscription.upsert({
        where: { patientId_professionalId: { patientId, professionalId } },
        create: {
          patientId,
          professionalId,
          status: "ACTIVE",
          startedAt: now,
          expiresAt,
          pricePaid: planPrice,
          currency: "MXN",
        },
        update: {
          status: "ACTIVE",
          startedAt: now,
          expiresAt,
          pricePaid: planPrice,
          currency: "MXN",
        },
      });

      await tx.payment.create({
        data: {
          payerId: patientId,
          payeeId: professionalId,
          amount: planPrice,
          currency: "MXN",
          status: "PAID",
          provider: "TEST",
          providerRef: charge.providerRef,
          patientSubscriptionId: subscription.id,
        },
      });
    });

    revalidatePath(`/profesional/${professionalId}`);
    revalidatePath("/paciente/dashboard/suscripcion");
    revalidatePath("/paciente/dashboard/rutina");

    await triggerPatientSubscribed({
      patientId,
      patientName: session.user.name ?? null,
      professionalId,
      expiresAt: expiresAt.toISOString(),
    });

    return { success: true };
  } catch {
    return { success: false, error: "Could not process the subscription." };
  }
}

export async function cancelPatientSubscription(professionalId: string) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "PATIENT") {
    return { success: false, error: "Unauthorized." };
  }

  if (!professionalId) {
    return { success: false, error: "Missing professional." };
  }

  const patientId = session.user.id;

  try {
    const existing = await prisma.patientSubscription.findUnique({
      where: { patientId_professionalId: { patientId, professionalId } },
      select: { status: true, expiresAt: true },
    });

    if (!existing) {
      return { success: false, error: "Subscription not found." };
    }

    if (existing.status === "EXPIRED" || existing.expiresAt <= new Date()) {
      return { success: false, error: "Subscription already expired." };
    }

    if (existing.status === "CANCELLED") {
      return { success: false, error: "Subscription already cancelled." };
    }

    // Streaming model: status flips to CANCELLED but expiresAt is preserved,
    // so the patient keeps personalized access until the paid period ends.
    await prisma.patientSubscription.update({
      where: { patientId_professionalId: { patientId, professionalId } },
      data: { status: "CANCELLED" },
    });

    revalidatePath(`/profesional/${professionalId}`);
    revalidatePath("/paciente/dashboard/suscripcion");
    revalidatePath("/paciente/dashboard/rutina");

    await triggerSubscriptionCancelled({
      patientId,
      patientName: session.user.name ?? null,
      professionalId,
      expiresAt: existing.expiresAt.toISOString(),
    });

    return { success: true };
  } catch {
    return { success: false, error: "Could not cancel the subscription." };
  }
}
