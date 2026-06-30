"use client";

import { Calendar, Clock, FileText, User } from "lucide-react";
import type { AppointmentWithUsers } from "@/lib/appointments";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface AppointmentCardProps {
  appointment: AppointmentWithUsers;
  role: "patient" | "professional";
  locale: string;
  dictionary: Dictionary;
}

const statusStyles: Record<
  AppointmentWithUsers["status"],
  string
> = {
  REQUESTED:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  CONFIRMED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  CANCELLED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  COMPLETED:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
};

export function AppointmentCard({
  appointment,
  role,
  locale,
  dictionary,
}: AppointmentCardProps) {
  const counterparty =
    role === "patient" ? appointment.professional : appointment.patient;

  const scheduledAt = appointment.scheduledAt;
  const dateLabel = scheduledAt.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeLabel = scheduledAt.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[appointment.status]}`}
            >
              {dictionary.appointments.status[appointment.status]}
            </span>
            <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              {dateLabel}
            </span>
            <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              {timeLabel}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <User className="h-4 w-4 text-slate-500" />
            </div>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {counterparty.name ||
                (role === "patient"
                  ? dictionary.patientMessages.defaultName
                  : dictionary.professionalMessages.defaultName)}
            </p>
          </div>
        </div>
      </div>

      {appointment.notes && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p className="text-sm text-slate-600 dark:text-slate-400">{appointment.notes}</p>
        </div>
      )}
    </div>
  );
}
