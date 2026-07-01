"use client";

import { useEffect } from "react";
import { markUserOnline } from "@/lib/actions/presence";

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

export function PresenceHeartbeat() {
  useEffect(() => {
    // Mark online immediately
    markUserOnline().catch(() => {
      // Silent fail; auth may be missing on public pages
    });

    const interval = setInterval(() => {
      markUserOnline().catch(() => {
        // Silent fail
      });
    }, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return null;
}
