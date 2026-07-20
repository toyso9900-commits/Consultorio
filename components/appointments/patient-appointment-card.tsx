"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
  User,
  Video,
  XCircle,
} from "lucide-react";
import { RatingForm } from "@/components/rating/rating-form";
import type { AppointmentWithUsers } from "@/lib/appointments";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface PatientAppointmentCardProps {
  appointment: AppointmentWithUsers;
  patientId: string;
  locale: string;
  dictionary: Dictionary;
}

const statusConfig: Record<
  AppointmentWithUsers["status"],
  {
    icon: React.ElementType;
    textColor: string;
    glow?: string;
  }
> = {
  REQUESTED: {
    icon: AlertCircle,
    textColor: "text-amber-400",
  },
  CONFIRMED: {
    icon: CheckCircle2,
    textColor: "text-[#4ade22]",
    glow: "drop-shadow-[0_0_6px_rgba(74,222,34,0.7)]",
  },
  CANCELLED: {
    icon: XCircle,
    textColor: "text-gray-500",
  },
  COMPLETED: {
    icon: CheckCircle2,
    textColor: "text-gray-400",
  },
};

const specialtyKeyMap: Record<string, keyof Dictionary["specialties"]> = {
  NUTRITION: "nutrition",
  TRAINING: "training",
  BOTH: "both",
};

export function PatientAppointmentCard({
  appointment,
  patientId,
  locale,
  dictionary,
}: PatientAppointmentCardProps) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);

  const professional = appointment.professional;
  const profile = professional.professionalProfile;
  const status = appointment.status;

  const specialtyKey = profile?.specialty
    ? specialtyKeyMap[profile.specialty]
    : undefined;
  const role =
    profile?.title ??
    (specialtyKey ? dictionary.specialties[specialtyKey] : undefined) ??
    dictionary.patientHome.nutritionist;

  const modality = profile?.modality ?? "ONLINE";

  const isVirtual = modality === "ONLINE" || modality === "BOTH";
  const isInPerson = modality === "IN_PERSON" || modality === "BOTH";

  const StatusIcon = statusConfig[status].icon;
  const dateTimeLabel = appointment.scheduledAt.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const capitalizedDateTimeLabel =
    dateTimeLabel.charAt(0).toUpperCase() + dateTimeLabel.slice(1);

  return (
    <div className="flex h-full flex-col rounded-2xl bg-[#2c2c2c] p-5 text-white shadow-sm">
      <div className="flex items-center gap-2">
        <StatusIcon
          className={`h-4 w-4 ${statusConfig[status].textColor} ${statusConfig[status].glow ?? ""}`}
        />
        <span
          className={`text-sm font-semibold ${statusConfig[status].textColor} ${statusConfig[status].glow ?? ""}`}
        >
          {dictionary.appointments.status[status]}
        </span>
      </div>

      <p className="mt-3 text-sm text-white/90">{capitalizedDateTimeLabel}</p>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
          {professional.image ? (
            <Image
              src={professional.image}
              alt=""
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-6 w-6 text-white/60" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-white">
            {professional.name || dictionary.patientMessages.defaultName}
          </p>
          <p className="truncate text-sm text-white/60">{role}</p>
        </div>
      </div>

      <Link
        href={`/profesional/${professional.id}`}
        className="mt-2 text-sm text-[#4ade22] hover:underline focus:outline-none focus:ring-2 focus:ring-[#4ade22] focus:ring-offset-2 focus:ring-offset-[#2c2c2c] rounded-sm w-fit"
      >
        {dictionary.patientHome.viewProfile}
      </Link>

      <div className="mt-4 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={() => setNotesOpen((prev) => !prev)}
          className="flex w-full items-center justify-between text-sm font-medium text-white/80 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-[#4ade22] focus:ring-offset-2 focus:ring-offset-[#2c2c2c] rounded-sm"
          aria-expanded={notesOpen}
        >
          {dictionary.appointments.card.notes}
          {notesOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {appointment.notes ? (
          <p
            className={`mt-2 text-sm text-white/70 ${notesOpen ? "" : "line-clamp-2"}`}
          >
            {appointment.notes}
          </p>
        ) : (
          <p className="mt-2 text-sm text-white/50">
            {dictionary.appointments.empty.patient}
          </p>
        )}
      </div>

      <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
        {isInPerson && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <MapPin className="h-4 w-4" />
              {dictionary.appointments.card.inPerson}
            </div>
            {profile?.location && (
              <div className="rounded-xl bg-[#1a1a1a] p-3">
                <p className="text-sm text-white/80">{profile.location}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#4ade22] transition-colors hover:text-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#4ade22] focus:ring-offset-2 focus:ring-offset-[#1a1a1a] rounded-sm"
                >
                  {dictionary.appointments.card.viewDirections}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        )}
        {isVirtual && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Video className="h-4 w-4" />
              {dictionary.appointments.card.virtual}
            </div>
            {appointment.meetingUrl ? (
              <a
                href={appointment.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-sm font-medium text-[#4ade22] transition-colors hover:text-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#4ade22] focus:ring-offset-2 focus:ring-offset-[#2c2c2c] rounded-sm"
              >
                {dictionary.appointments.card.viewDetails}
              </a>
            ) : (
              <p className="text-sm text-white/50">
                {dictionary.appointments.card.waitingForMeetingLink}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto pt-5">
        {status === "COMPLETED" && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#4ade22] focus:ring-offset-2 focus:ring-offset-[#2c2c2c]"
              >
                {dictionary.appointments.actions.viewSummary}
              </button>
              <button
                type="button"
                onClick={() => setRatingOpen((prev) => !prev)}
                className="rounded-xl bg-[#4ade22] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#4ade22] focus:ring-offset-2 focus:ring-offset-[#2c2c2c]"
              >
                {dictionary.appointments.actions.rate}
              </button>
            </div>
            {ratingOpen && (
              <div className="rounded-xl bg-[#1a1a1a] p-3">
                <RatingForm
                  appointmentId={appointment.id}
                  patientId={patientId}
                  professionalName={professional.name}
                  scheduledAt={appointment.scheduledAt}
                  onSubmitted={() => setRatingOpen(false)}
                />
              </div>
            )}
          </div>
        )}
        {status === "CONFIRMED" && isVirtual && (
          <>
            {appointment.meetingUrl ? (
              <a
                href={appointment.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#22c55e] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_rgba(34,197,94,0.45)] transition-colors hover:bg-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#4ade22] focus:ring-offset-2 focus:ring-offset-[#2c2c2c]"
              >
                <Video className="h-4 w-4" />
                {dictionary.appointments.meeting.joinGoogleMeet}
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex w-full items-center justify-center rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/50 disabled:cursor-not-allowed"
              >
                {dictionary.appointments.card.waitingForLink}
              </button>
            )}
          </>
        )}
        {status === "REQUESTED" && (
          <p className="text-sm text-white/50">
            {dictionary.appointments.card.requestSent}
          </p>
        )}
        {status === "CANCELLED" && (
          <p className="text-sm text-white/50">
            {dictionary.appointments.card.cancelled}
          </p>
        )}
      </div>
    </div>
  );
}
