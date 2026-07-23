"use client";

import Image from "next/image";
import {
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
} from "lucide-react";
import { MeetingLinkBlock } from "./meeting-link-block";
import type { AppointmentWithUsers } from "@/lib/appointments";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface ProfessionalAppointmentCardProps {
  appointment: AppointmentWithUsers;
  locale: string;
  dictionary: Dictionary;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  isPending?: boolean;
}

const specialtyKeyMap: Record<string, keyof Dictionary["specialties"]> = {
  NUTRITION: "nutrition",
  TRAINING: "training",
  BOTH: "both",
};

export function ProfessionalAppointmentCard({
  appointment,
  locale,
  dictionary,
  onComplete,
  onCancel,
  isPending,
}: ProfessionalAppointmentCardProps) {
  const patient = appointment.patient;
  const profile = appointment.professional.professionalProfile;
  const specialtyKey = profile?.specialty
    ? specialtyKeyMap[profile.specialty]
    : undefined;
  const specialty = specialtyKey
    ? dictionary.specialties[specialtyKey]
    : undefined;

  const modality = profile?.modality ?? "ONLINE";
  const isVirtual = modality === "ONLINE" || modality === "BOTH";
  const isInPerson = modality === "IN_PERSON" || modality === "BOTH";

  const dateLabel = appointment.scheduledAt.toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeLabel = appointment.scheduledAt.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const StatusIcon =
    appointment.status === "CONFIRMED" ? CheckCircle2 : XCircle;
  const statusColor =
    appointment.status === "CONFIRMED"
      ? "text-[#55eb55]"
      : "text-white/50";

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#2f2c28] bg-[#23201d] p-5 text-white shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1c1917]">
          {patient.image ? (
            <Image
              src={patient.image}
              alt=""
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-6 w-6 text-white/50" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">
            {patient.name || dictionary.professionalMessages.defaultName}
          </p>
          {specialty && (
            <p className="truncate text-sm text-white/60">{specialty}</p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {dateLabel}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeLabel}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <StatusIcon className={`h-3.5 w-3.5 ${statusColor}`} />
            <span className={`text-xs font-medium ${statusColor}`}>
              {dictionary.appointments.status[appointment.status]}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-3">
        {isVirtual && (
          <MeetingLinkBlock
            appointmentId={appointment.id}
            initialUrl={appointment.meetingUrl}
            dictionary={dictionary}
          />
        )}
        {isInPerson && profile?.location && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-white/80">
              <MapPin className="h-4 w-4 text-[#55eb55]" />
              {dictionary.appointments.card.location}
            </div>
            <div className="rounded-xl bg-[#1a1a1a] p-3">
              <p className="text-sm text-white/80">{profile.location}</p>
            </div>
          </div>
        )}
      </div>

      {(onComplete || onCancel) && (
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {onComplete && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => onComplete(appointment.id)}
              className="flex-1 rounded-xl bg-[#55eb55] px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#45db45] disabled:opacity-60"
            >
              {dictionary.appointments.actions.complete}
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => onCancel(appointment.id)}
              className="flex-1 rounded-xl border border-[#3a3a3a] bg-[#2c2c2c] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3a3a3a] disabled:opacity-60"
            >
              {dictionary.appointments.actions.cancel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
