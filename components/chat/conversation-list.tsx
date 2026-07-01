"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Pusher from "pusher-js";
import {
  getPusherClientConfig,
  isPusherClientConfigured,
} from "@/lib/pusher-client";
import { userChannel } from "@/lib/pusher-shared";

export interface ConversationUser {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

interface ConversationListProps {
  initialConversations: ConversationUser[];
  currentUserId: string;
  selectedUserId?: string;
  emptyMessage?: string;
  hrefPrefix?: string;
  initialOnlineStatus?: Record<string, boolean>;
}

const MAX_PREVIEW_LENGTH = 60;

function truncatePreview(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

function formatMessageTime(date: Date): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

function sortByLatest(
  a: ConversationUser,
  b: ConversationUser
): number {
  return (
    new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

export function ConversationList({
  initialConversations,
  currentUserId,
  selectedUserId,
  emptyMessage = "No tenés conversaciones todavía.",
  hrefPrefix = "/profesional/dashboard/mensajes",
  initialOnlineStatus = {},
}: ConversationListProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [onlineStatus, setOnlineStatus] = useState(initialOnlineStatus);

  useEffect(() => {
    if (!isPusherClientConfigured()) {
      return;
    }

    const { key, cluster } = getPusherClientConfig();
    const pusherClient = new Pusher(key, {
      cluster,
      authEndpoint: "/api/pusher/auth",
      authTransport: "ajax",
    });

    const channelName = userChannel(currentUserId);
    const channel = pusherClient.subscribe(channelName);

    channel.bind(
      "unread-counts",
      ({ counts }: { counts: { senderId: string; count: number }[] }) => {
        const countsMap = new Map(counts.map((c) => [c.senderId, c.count]));
        setConversations((prev) => {
          return prev
            .map((conv) => {
              return { ...conv, unreadCount: countsMap.get(conv.id) || 0 };
            })
            .sort(sortByLatest);
        });
      }
    );

    channel.bind(
      "conversation-read",
      ({ senderId }: { senderId: string }) => {
        setConversations((prev) => {
          return prev.map((conv) => {
            return conv.id === senderId
              ? { ...conv, unreadCount: 0 }
              : conv;
          });
        });
      }
    );

    channel.bind(
      "new-message",
      (message: {
        senderId: string;
        receiverId: string;
        content: string;
        createdAt: string;
        sender: { id: string; name: string | null; image: string | null };
      }) => {
        const partnerId =
          message.senderId === currentUserId
            ? message.receiverId
            : message.senderId;

        setConversations((prev) => {
          const existing = prev.find((c) => c.id === partnerId);
          const updatedList = prev.filter((c) => c.id !== partnerId);

          const newConversation: ConversationUser = {
            id: partnerId,
            name: existing?.name ?? message.sender.name ?? "Usuario",
            image: existing?.image ?? message.sender.image ?? null,
            role: existing?.role ?? "PATIENT",
            lastMessage: message.content,
            lastMessageAt: new Date(message.createdAt),
            unreadCount:
              message.receiverId === currentUserId
                ? (existing?.unreadCount ?? 0) + 1
                : existing?.unreadCount ?? 0,
          };

          return [newConversation, ...updatedList].sort(sortByLatest);
        });

        setOnlineStatus((prev) => ({ ...prev, [partnerId]: true }));
      }
    );

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [currentUserId]);

  if (conversations.length === 0) {
    return (
      <p className="p-4 text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
    );
  }

  return (
    <ul className="space-y-1">
      {conversations.map((user) => {
        const href = `${hrefPrefix}?paciente=${encodeURIComponent(
          user.id
        )}&nombre=${encodeURIComponent(user.name || "Paciente")}`;
        const isActive = user.id === selectedUserId;

        return (
          <li key={user.id}>
            <Link
              href={href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {(user.name || "U").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {user.name || "Paciente"}
                      {onlineStatus[user.id] && (
                        <span
                          className="ml-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500"
                          title="En línea"
                        />
                      )}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {truncatePreview(user.lastMessage, MAX_PREVIEW_LENGTH)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {formatMessageTime(user.lastMessageAt)}
                  </span>
                  {user.unreadCount > 0 ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                      {user.unreadCount > 99 ? "99+" : user.unreadCount}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
