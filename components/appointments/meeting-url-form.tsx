"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateMeetingUrl } from "@/app/profesional/dashboard/appointment-actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface MeetingUrlFormProps {
  appointmentId: string;
  initialUrl: string | null;
  dictionary: Dictionary;
  variant?: "default" | "dark";
}

export function MeetingUrlForm({
  appointmentId,
  initialUrl,
  dictionary,
  variant = "default",
}: MeetingUrlFormProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialUrl ?? "");
  const [isPending, startTransition] = useTransition();

  const isDark = variant === "dark";

  function handleSave() {
    startTransition(async () => {
      const result = await updateMeetingUrl({
        appointmentId,
        meetingUrl: value,
      });

      if (result.success) {
        toast.success(dictionary.appointments.meeting.saved);
        router.refresh();
      } else {
        toast.error(result.error || dictionary.errors.generic);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor={`meeting-url-${appointmentId}`} className="sr-only">
        {dictionary.appointments.meeting.label}
      </label>
      <input
        id={`meeting-url-${appointmentId}`}
        type="url"
        value={value}
        disabled={isPending}
        onChange={(event) => setValue(event.target.value)}
        placeholder={dictionary.appointments.meeting.placeholder}
        className={`rounded-xl px-3 py-2 text-sm disabled:opacity-60 ${
          isDark
            ? "w-full border border-[#3a3a3a] bg-[#1a1a1a] text-white placeholder:text-white/40 focus:border-[#55eb55] focus:outline-none focus:ring-1 focus:ring-[#55eb55]"
            : "w-64 border border-border bg-card text-card-foreground placeholder:text-muted-foreground"
        }`}
      />
      <button
        type="button"
        disabled={isPending}
        onClick={handleSave}
        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
          isDark
            ? "border border-[#3a3a3a] bg-[#2c2c2c] text-white hover:bg-[#3a3a3a]"
            : "border border-border bg-card text-card-foreground hover:bg-muted"
        }`}
      >
        {isPending
          ? dictionary.appointments.meeting.saving
          : dictionary.appointments.meeting.save}
      </button>
    </div>
  );
}
