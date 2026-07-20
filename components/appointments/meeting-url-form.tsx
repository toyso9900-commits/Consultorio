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
}

export function MeetingUrlForm({
  appointmentId,
  initialUrl,
  dictionary,
}: MeetingUrlFormProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialUrl ?? "");
  const [isPending, startTransition] = useTransition();

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
        className="w-64 rounded-xl border border-border bg-card px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground disabled:opacity-60"
      />
      <button
        type="button"
        disabled={isPending}
        onClick={handleSave}
        className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-muted disabled:opacity-60"
      >
        {isPending
          ? dictionary.appointments.meeting.saving
          : dictionary.appointments.meeting.save}
      </button>
    </div>
  );
}
