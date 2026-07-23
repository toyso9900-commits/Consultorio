"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Pencil, Wifi, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { updateMeetingUrl } from "@/app/profesional/dashboard/appointment-actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface MeetingLinkBlockProps {
  appointmentId: string;
  initialUrl: string | null;
  dictionary: Dictionary;
}

export function MeetingLinkBlock({
  appointmentId,
  initialUrl,
  dictionary,
}: MeetingLinkBlockProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialUrl ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleCopy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(dictionary.appointments.card.copied);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(dictionary.errors.generic);
    }
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateMeetingUrl({
        appointmentId,
        meetingUrl: value,
      });

      if (result.success) {
        toast.success(dictionary.appointments.meeting.saved);
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(result.error || dictionary.errors.generic);
      }
    });
  }

  function handleCancel() {
    setIsEditing(false);
    setValue(initialUrl ?? "");
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-white/80">
        <Wifi className="h-4 w-4 text-[#55eb55]" />
        {dictionary.appointments.card.online}
      </div>
      <div className="rounded-xl bg-[#1a1a1a] p-3">
        {isEditing ? (
          <div className="space-y-2">
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
              className="w-full rounded-lg border border-[#3a3a3a] bg-[#2c2c2c] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#55eb55] focus:outline-none focus:ring-1 focus:ring-[#55eb55] disabled:opacity-60"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="rounded-lg border border-[#3a3a3a] bg-[#2c2c2c] px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-[#3a3a3a] disabled:opacity-60"
              >
                {dictionary.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="rounded-lg bg-[#55eb55] px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-[#45db45] disabled:opacity-60"
              >
                {isPending
                  ? dictionary.appointments.meeting.saving
                  : dictionary.common.save}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="url"
                readOnly
                value={value}
                className="min-w-0 flex-1 rounded-lg border border-[#3a3a3a] bg-[#0f0f0f] px-3 py-2 text-sm text-white/70"
              />
              <button
                type="button"
                onClick={handleCopy}
                disabled={!value}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#3a3a3a] bg-[#2c2c2c] px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-[#3a3a3a] disabled:opacity-50"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-[#55eb55]" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied
                  ? dictionary.appointments.card.copied
                  : dictionary.appointments.card.copy}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex shrink-0 items-center justify-center rounded-lg border border-[#3a3a3a] bg-[#2c2c2c] p-2 text-white/80 transition-colors hover:bg-[#3a3a3a]"
                aria-label={dictionary.appointments.card.editLink}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
            {value ? (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-[#55eb55] transition-colors hover:text-[#45db45]"
              >
                {dictionary.appointments.meeting.join}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-sm font-medium text-[#55eb55] transition-colors hover:text-[#45db45]"
              >
                {dictionary.appointments.card.assignNewLink}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
