"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { useRouter } from "next/navigation";
import {
  getPusherClientConfig,
  isPusherClientConfigured,
} from "@/lib/pusher-client";
import { userChannel } from "@/lib/pusher-shared";

interface AppointmentsRealtimeListenerProps {
  userId: string;
}

export function AppointmentsRealtimeListener({
  userId,
}: AppointmentsRealtimeListenerProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isPusherClientConfigured() || !userId) {
      return;
    }

    const { key, cluster } = getPusherClientConfig();
    const pusherClient = new Pusher(key, {
      cluster,
      authEndpoint: "/api/pusher/auth",
      authTransport: "ajax",
    });

    const channelName = userChannel(userId);
    const channel = pusherClient.subscribe(channelName);

    channel.bind("appointment-created", () => {
      router.refresh();
    });

    channel.bind("appointment-updated", () => {
      router.refresh();
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [router, userId]);

  return null;
}
