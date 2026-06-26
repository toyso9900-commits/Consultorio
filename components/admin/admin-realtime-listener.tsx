"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { useRouter } from "next/navigation";
import {
  getPusherClientConfig,
  isPusherClientConfigured,
} from "@/lib/pusher-client";
import { ADMIN_CHANNEL } from "@/lib/pusher-shared";

export function AdminRealtimeListener() {
  const router = useRouter();

  useEffect(() => {
    if (!isPusherClientConfigured()) {
      console.warn("Pusher client not configured; admin real-time updates disabled.");
      return;
    }

    const { key, cluster } = getPusherClientConfig();
    const pusherClient = new Pusher(key, {
      cluster,
      authEndpoint: "/api/pusher/auth",
      authTransport: "ajax",
    });

    const channel = pusherClient.subscribe(ADMIN_CHANNEL);

    channel.bind("admin-updates", () => {
      router.refresh();
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(ADMIN_CHANNEL);
    };
  }, [router]);

  return null;
}
