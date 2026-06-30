"use client";

import { useState, useTransition } from "react";
import {
  acceptAppointment,
  rejectAppointment,
} from "@/app/profesional/dashboard/appointment-actions";
import { AppointmentCard } from "./appointment-card";
import type { AppointmentWithUsers } from "@/lib/appointments";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface AppointmentRequestListProps {
  appointments: AppointmentWithUsers[];
  locale: string;
  dictionary: Dictionary;
}

export function AppointmentRequestList({
  appointments,
  locale,
  dictionary,
}: AppointmentRequestListProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ id: string; error: string } | null>(
    null
  );

  function handleAction(
    appointmentId: string,
    action: "accept" | "reject"
  ) {
    setFeedback(null);
    startTransition(async () => {
      const result =
        action === "accept"
          ? await acceptAppointment(appointmentId)
          : await rejectAppointment(appointmentId);

      if (!result.success) {
        const key = result.error as keyof typeof dictionary.appointments.errors;
        setFeedback({
          id: appointmentId,
          error:
            dictionary.appointments.errors[key] ||
            dictionary.errors.generic,
        });
      }
    });
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-400">
          {dictionary.appointments.empty.professional}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="space-y-3">
          <AppointmentCard
            appointment={appointment}
            role="professional"
            locale={locale}
            dictionary={dictionary}
          />
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleAction(appointment.id, "accept")}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
            >
              {dictionary.appointments.actions.accept}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleAction(appointment.id, "reject")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {dictionary.appointments.actions.reject}
            </button>
          </div>
          {feedback?.id === appointment.id && (
            <p className="text-sm text-rose-600 dark:text-rose-400">{feedback.error}</p>
          )}
        </div>
      ))}
    </div>
  );
}
