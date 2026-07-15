"use client";

import { useEffect } from "react";
import { saveDetectedTimezone } from "@/app/paciente/dashboard/rutina/actions";

/**
 * Timezone auto-detect island (DPT-004): reads the browser's IANA zone and
 * asks the server to persist it ONLY when User.timezone is still null —
 * a manual profile choice is never overwritten. Renders nothing.
 */
export function TimezoneAutoDetect() {
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      void saveDetectedTimezone(tz);
    }
  }, []);

  return null;
}
