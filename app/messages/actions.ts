"use server";

import { prisma } from "@/lib/prisma";
import {
  triggerMessage,
  triggerUnreadCounts,
  triggerConversationRead,
} from "@/lib/pusher-server";

export interface MessagePayload {
  senderId: string;
  receiverId: string;
  content: string;
}

export async function sendMessage(payload: MessagePayload) {
  const { senderId, receiverId, content } = payload;

  if (!senderId || !receiverId || !content.trim()) {
    return { success: false, error: "Datos incompletos." };
  }

  try {
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
      },
    });

    const messagePayload = {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        image: message.sender.image,
      },
    };

    // Trigger Pusher in the background; don't await it
    triggerMessage(messagePayload).catch(() => {});

    getUnreadCountsBySender(receiverId)
      .then((counts) => {
        if (counts.success && "counts" in counts) {
          triggerUnreadCounts(receiverId, counts.counts).catch(() => {});
        }
      })
      .catch(() => {});

    return { success: true, message };
  } catch {
    return { success: false, error: "No se pudo enviar el mensaje." };
  }
}

export async function getConversation(userId: string, otherId: string): Promise<
  | { success: true; messages: ({ sender: { id: string; name: string | null; image: string | null } } & { id: string; createdAt: Date; senderId: string; receiverId: string; content: string; readAt: Date | null })[] }
  | { success: false; error: string }
> {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });

    return { success: true, messages };
  } catch {
    return { success: false, error: "No se pudo cargar la conversación." };
  }
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  try {
    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        readAt: null,
      },
    });
    return count;
  } catch {
    return 0;
  }
}

export async function getUnreadCountsBySender(
  userId: string
): Promise<{ success: true; counts: { senderId: string; count: number }[] } | { success: false; error: string }> {
  try {
    const unreadMessages = await prisma.message.findMany({
      where: {
        receiverId: userId,
        readAt: null,
      },
      select: {
        senderId: true,
      },
    });

    const countsMap = new Map<string, number>();
    for (const message of unreadMessages) {
      countsMap.set(message.senderId, (countsMap.get(message.senderId) || 0) + 1);
    }

    const counts = Array.from(countsMap.entries()).map(([senderId, count]) => ({
      senderId,
      count,
    }));

    return { success: true, counts };
  } catch {
    return { success: false, error: "No se pudieron cargar los conteos." };
  }
}

export async function markMessagesAsRead(receiverId: string, senderId: string) {
  try {
    await prisma.message.updateMany({
      where: {
        senderId,
        receiverId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    triggerConversationRead(receiverId, senderId).catch(() => {});

    getUnreadCountsBySender(receiverId)
      .then((result) => {
        if (result.success && "counts" in result) {
          triggerUnreadCounts(receiverId, result.counts).catch(() => {});
        }
      })
      .catch(() => {});

    return { success: true };
  } catch {
    return { success: false };
  }
}

export interface ConversationUser {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

export async function getUserConversations(userId: string): Promise<
  | { success: true; users: ConversationUser[] }
  | { success: false; error: string }
> {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, name: true, image: true, role: true } },
        receiver: { select: { id: true, name: true, image: true, role: true } },
      },
    });

    const conversationMap = new Map<string, ConversationUser>();
    const unreadCounts = new Map<string, number>();

    for (const message of messages) {
      const partner = message.senderId === userId ? message.receiver : message.sender;

      if (!conversationMap.has(partner.id)) {
        conversationMap.set(partner.id, {
          id: partner.id,
          name: partner.name,
          image: partner.image,
          role: partner.role,
          lastMessage: message.content,
          lastMessageAt: message.createdAt,
          unreadCount: 0,
        });
      }

      if (message.receiverId === userId && message.readAt === null) {
        unreadCounts.set(partner.id, (unreadCounts.get(partner.id) || 0) + 1);
      }
    }

    const users = Array.from(conversationMap.values()).map((user) => ({
      ...user,
      unreadCount: unreadCounts.get(user.id) || 0,
    }));

    return { success: true, users };
  } catch {
    return { success: false, error: "No se pudieron cargar las conversaciones." };
  }
}
