import { prisma } from "@/lib/prisma";

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      plan: { in: ["PREMIUM", "PRO"] },
      status: "ACTIVE",
      OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
    },
  });

  return subscription !== null;
}
