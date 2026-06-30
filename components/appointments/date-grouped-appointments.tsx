"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AppointmentCard } from "./appointment-card";
import {
  cancelAppointment,
  completeAppointment,
} from "@/app/profesional/dashboard/appointment-actions";
import type { AppointmentWithUsers } from "@/lib/appointments";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface DateGroupedAppointmentsProps {
  appointments: AppointmentWithUsers[];
  role: "patient" | "professional";
  locale: string;
  dictionary: Dictionary;
}

export function DateGroupedAppointments({
  appointments,
  role,
  locale,
  dictionary,
}: DateGroupedAppointmentsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ id: string; error: string } | null>(
    null
  );

  function handleAction(
    appointmentId: string,
    action: "cancel" | "complete"
  ) {
    const confirmationKey = action === "cancel" ? "cancel" : "complete";
    const confirmationMessage =
      dictionary.appointments.confirmations[confirmationKey];

    if (!confirm(confirmationMessage)) {
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const result =
        action === "cancel"
          ? await cancelAppointment(appointmentId)
          : await completeAppointment(appointmentId);

      if (result.success) {
        router.refresh();
      } else {
        const key = result.error as keyof typeof dictionary.appointments.errors;
        setFeedback({
          id: appointmentId,
          error:
            dictionary.appointments.errors[key] || dictionary.errors.generic,
        });
      }
    });
  }
  const grouped = appointments.reduce<Record<string, AppointmentWithUsers[]>>(
    (acc, appointment) => {
      const dateKey = appointment.scheduledAt.toISOString().split("T")[0];
      acc[dateKey] = acc[dateKey] ?? [];
      acc[dateKey].push(appointment);
      return acc;
    },
    {}
  );

  const sortedGroups = Object.entries(grouped).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-400">
          {role === "patient"
            ? dictionary.appointments.empty.patient
            : dictionary.appointments.empty.professional}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedGroups.map(([dateKey, group]) => {
        const date = new Date(dateKey);
        const dateLabel = date.toLocaleDateString(locale, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return (
          <section key={dateKey} className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {dateLabel}
            </h3>
            <div className="space-y-4">
              {group
                .sort(
                  (a, b) =>
                    a.scheduledAt.getTime() - b.scheduledAt.getTime()
                )
                .map((appointment) => (
                  <div key={appointment.id} className="space-y-3">
                    <AppointmentCard
                      appointment={appointment}
                      role={role}
                      locale={locale}
                      dictionary={dictionary}
                    />
                    {role === "professional" &&
                      appointment.status === "CONFIRMED" && (
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              handleAction(appointment.id, "complete")
                            }
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {dictionary.appointments.actions.complete}
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              handleAction(appointment.id, "cancel")
                            }
                            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
                          >
                            {dictionary.appointments.actions.cancel}
                          </button>
                        </div>
                      )}
                    {feedback?.id === appointment.id && (
                      <p className="text-sm text-rose-600 dark:text-rose-400">
                        {feedback.error}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
