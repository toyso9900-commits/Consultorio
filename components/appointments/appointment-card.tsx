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
  CANCELLED: "bg-muted text-muted-foreground",
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
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[appointment.status]}`}
            >
              {dictionary.appointments.status[appointment.status]}
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {dateLabel}
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {timeLabel}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="font-medium text-card-foreground">
              {counterparty.name ||
                (role === "patient"
                  ? dictionary.patientMessages.defaultName
                  : dictionary.professionalMessages.defaultName)}
            </p>
          </div>
        </div>
      </div>

      {appointment.notes && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted p-3">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{appointment.notes}</p>
        </div>
      )}
    </div>
  );
}
