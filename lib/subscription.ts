import { prisma } from "@/lib/prisma";

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      plan: "PREMIUM",
      status: "ACTIVE",
      OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
    },
  });

  return subscription !== null;
}
