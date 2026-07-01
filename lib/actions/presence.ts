"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isUserOnline } from "@/lib/presence";

export async function markUserOnline(): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: { lastSeenAt: new Date() },
  });
}

export async function markUserOffline(): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: { lastSeenAt: null },
  });
}

export async function getUsersOnlineStatus(
  userIds: string[]
): Promise<Map<string, boolean>> {
  if (userIds.length === 0) return new Map();

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, lastSeenAt: true },
  });

  return new Map(users.map((u) => [u.id, isUserOnline(u.lastSeenAt)]));
}
