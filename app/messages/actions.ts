"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { triggerMessage } from "@/lib/pusher";

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

    await triggerMessage({
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
    });

    revalidatePath("/paciente/dashboard/mensajes");
    revalidatePath("/profesional/dashboard/mensajes");

    return { success: true, message };
  } catch (error) {
    console.error("Send message error:", error);
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
  } catch (error) {
    console.error("Get conversation error:", error);
    return { success: false, error: "No se pudo cargar la conversación." };
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

    return { success: true };
  } catch (error) {
    console.error("Mark messages as read error:", error);
    return { success: false };
  }
}

export async function getUserConversations(userId: string): Promise<
  | { success: true; users: { id: string; name: string | null; image: string | null; role: string }[] }
  | { success: false; error: string }
> {
  try {
    const sent = await prisma.message.groupBy({
      by: ["receiverId"],
      where: { senderId: userId },
    });
    const received = await prisma.message.groupBy({
      by: ["senderId"],
      where: { receiverId: userId },
    });

    const ids = Array.from(
      new Set([
        ...sent.map((s) => s.receiverId),
        ...received.map((r) => r.senderId),
      ])
    );

    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, image: true, role: true },
    });

    return { success: true, users };
  } catch (error) {
    console.error("Get conversations error:", error);
    return { success: false, error: "No se pudieron cargar las conversaciones." };
  }
}
