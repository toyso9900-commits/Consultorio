"use client";

import { useState, useTransition } from "react";
import { sendMessage } from "@/app/messages/actions";
import type { Dictionary } from "@/lib/i18n/server";

interface PendingActionModalProps {
  dictionary: Dictionary;
  patientId: string;
  patientName: string;
  professionalId: string;
  action: "progress-photo" | "meal";
  trigger: React.ReactNode;
}

export function PendingActionModal({
  dictionary,
  patientId,
  patientName,
  professionalId,
  action,
  trigger,
}: PendingActionModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(
    action === "progress-photo"
      ? `Hola ${patientName}, recordá subir tu foto de progreso para seguir tu evolución.`
      : `Hola ${patientName}, ¿cómo venís con la alimentación? Recordá registrar tus comidas.`
  );

  function handleSubmit() {
    if (!message.trim()) return;

    startTransition(async () => {
      const result = await sendMessage({
        senderId: professionalId,
        receiverId: patientId,
        content: message,
      });

      if (result.success) {
        setOpen(false);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
      >
        {trigger}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-lg dark:bg-stone-800">
            <h3 className="text-lg font-semibold text-foreground dark:text-stone-100">
              {action === "progress-photo"
                ? dictionary.professionalDashboard.progressPhotoPending
                : dictionary.professionalDashboard.mealLogPending}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground dark:text-stone-400">
              Paciente: {patientName}
            </p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="mt-4 w-full rounded-lg border border-border bg-muted p-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-stone-700/30 dark:text-stone-100"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted dark:text-stone-400"
              >
                {dictionary.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || !message.trim()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
                {isPending ? dictionary.common.sending : dictionary.common.send}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
