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
      <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
        <p className="text-muted-foreground">
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
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-muted disabled:opacity-60"
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
