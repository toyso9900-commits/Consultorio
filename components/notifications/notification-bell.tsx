"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell } from "lucide-react";
import Pusher from "pusher-js";
import {
  getPusherClientConfig,
  isPusherClientConfigured,
} from "@/lib/pusher-client";
import { userChannel, ADMIN_CHANNEL } from "@/lib/pusher-shared";
import type { NotificationItem } from "@/lib/notifications";
import type { Dictionary } from "@/lib/i18n/server";

interface NotificationBellProps {
  userId: string;
  role: "ADMIN" | "PROFESSIONAL" | "PATIENT";
  initialNotifications: NotificationItem[];
  dictionary: Dictionary;
}

function formatRelativeTime(date: Date, dictionary: Dictionary): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Ahora";
  if (diffMinutes < 60)
    return dictionary.adminDashboard.minutesAgo.replace("{count}", String(diffMinutes));
  if (diffHours < 24)
    return dictionary.adminDashboard.hoursAgo.replace("{count}", String(diffHours));
  return `${diffDays} d`;
}

export function NotificationBell({
  userId,
  role,
  initialNotifications,
  dictionary,
}: NotificationBellProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [open, setOpen] = useState(false);

  const count = notifications.filter((notification) => !notification.read).length;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen && count > 0) {
      // Optimistically clear the badge; persist the read timestamp without
      // waiting for the response (fire-and-forget).
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
      fetch("/api/notifications", { method: "POST" }).catch(() => {});
    }
  };

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

    const userChan = pusherClient.subscribe(userChannel(userId));

    const refetch = () => {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.notifications)) {
            setNotifications(data.notifications);
          }
        })
        .catch(() => {});
    };

    userChan.bind("new-message", refetch);
    userChan.bind("appointment-created", refetch);
    userChan.bind("appointment-updated", refetch);
    userChan.bind("patient-subscribed", refetch);
    userChan.bind("subscription-cancelled", refetch);
    userChan.bind("routine-published", refetch);

    if (role === "ADMIN") {
      const adminChan = pusherClient.subscribe(ADMIN_CHANNEL);
      adminChan.bind("admin-updates", refetch);
    }

    return () => {
      userChan.unbind("new-message", refetch);
      userChan.unbind("appointment-created", refetch);
      userChan.unbind("appointment-updated", refetch);
      userChan.unbind("patient-subscribed", refetch);
      userChan.unbind("subscription-cancelled", refetch);
      userChan.unbind("routine-published", refetch);
      pusherClient.unsubscribe(userChannel(userId));
      if (role === "ADMIN") {
        pusherClient.unsubscribe(ADMIN_CHANNEL);
      }
    };
  }, [userId, role]);

  return (
    <DropdownMenu.Root open={open} onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="relative rounded-full bg-card p-2.5 shadow-sm ring-1 ring-border dark:bg-stone-800 dark:ring-stone-700"
          aria-label={dictionary.common.notifications}
        >
          <Bell className="h-5 w-5 text-muted-foreground dark:text-stone-300" />
          {count > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 rounded-xl border border-border bg-card p-1 shadow-lg dark:bg-stone-800"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="text-sm font-semibold text-foreground dark:text-stone-100">
              {dictionary.common.notifications}
            </p>
          </div>

          {notifications.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground dark:text-stone-400"
>
              {dictionary.notifications.empty}
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <Link
                    href={notification.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-2.5 transition-colors hover:bg-muted dark:hover:bg-stone-700/40${
                      notification.read ? " opacity-60" : ""
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground dark:text-stone-100">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-stone-400">
                      {notification.description}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground dark:text-stone-500">
                      {formatRelativeTime(notification.createdAt, dictionary)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
