"use client";

import { AppointmentCard } from "./appointment-card";
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
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    role={role}
                    locale={locale}
                    dictionary={dictionary}
                  />
                ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
