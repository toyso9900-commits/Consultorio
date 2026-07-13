import { prisma } from "@/lib/prisma";

/**
 * Returns true when the patient–professional pair has a subscription that
 * still grants access: status ACTIVE or CANCELLED (not yet expired), with
 * `expiresAt` in the future. EXPIRED status always returns false.
 *
 * Lazy-expiry semantics: we never write EXPIRED on a cron — instead, reads
 * use this read-time predicate and EXPIRED is only persisted on resubscribe.
 */
export async function hasActivePatientSubscription(
  patientId: string,
  professionalId: string
): Promise<boolean> {
  const sub = await prisma.patientSubscription.findUnique({
    where: { patientId_professionalId: { patientId, professionalId } },
    select: { status: true, expiresAt: true },
  });

  if (!sub || sub.status === "EXPIRED") return false;
  return sub.expiresAt > new Date();
}

export async function listActiveSubscriptionsForPatient(patientId: string) {
  const now = new Date();

  return prisma.patientSubscription.findMany({
    where: {
      patientId,
      status: { in: ["ACTIVE", "CANCELLED"] },
      expiresAt: { gt: now },
    },
    include: {
      professional: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPatientSubscription(
  patientId: string,
  professionalId: string
) {
  return prisma.patientSubscription.findUnique({
    where: { patientId_professionalId: { patientId, professionalId } },
    include: {
      professional: { select: { id: true, name: true, image: true } },
    },
  });
}
