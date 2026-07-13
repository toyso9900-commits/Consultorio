"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { publishRoutineForPatient } from "./actions";
import { useI18n } from "@/lib/i18n/client";

interface RoutineEditorProps {
  patientId: string;
  initialTitle: string;
  initialContent: string;
}

export function RoutineEditor({
  patientId,
  initialTitle,
  initialContent,
}: RoutineEditorProps) {
  const { dictionary } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  const hasExisting = initialTitle !== "" || initialContent !== "";
  const t = dictionary.professionalRoutines;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;

    startTransition(async () => {
      const result = await publishRoutineForPatient(patientId, title, content);
      if (result.success) {
        toast.success(t.saveSuccess);
      } else if ("errorCode" in result && result.errorCode === "not-subscribed") {
        toast.error(t.notSubscribedError);
      } else {
        toast.error(result.error || t.saveError);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <label
          htmlFor={`routine-title-${patientId}`}
          className="block text-sm font-medium text-foreground"
        >
          {t.titleLabel}
        </label>
        <input
          id={`routine-title-${patientId}`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label
          htmlFor={`routine-content-${patientId}`}
          className="block text-sm font-medium text-foreground"
        >
          {t.contentLabel}
        </label>
        <textarea
          id={`routine-content-${patientId}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={6}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {hasExisting ? t.updateCta : t.publishCta}
        </button>
      </div>
    </form>
  );
}
