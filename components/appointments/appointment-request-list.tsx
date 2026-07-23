"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Check,
  Clock,
  User,
  Wifi,
  X,
} from "lucide-react";
import {
  acceptAppointment,
  rejectAppointment,
} from "@/app/profesional/dashboard/appointment-actions";
import { MeetingUrlForm } from "./meeting-url-form";
import type { AppointmentWithUsers } from "@/lib/appointments";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface AppointmentRequestListProps {
  appointments: AppointmentWithUsers[];
  locale: string;
  dictionary: Dictionary;
}

const specialtyKeyMap: Record<string, keyof Dictionary["specialties"]> = {
  NUTRITION: "nutrition",
  TRAINING: "training",
  BOTH: "both",
};

export function AppointmentRequestList({
  appointments,
  locale,
  dictionary,
}: AppointmentRequestListProps) {
  const router = useRouter();
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
      } else {
        router.refresh();
      }
    });
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border border-[#2f2c28] bg-[#23201d] p-12 text-center shadow-sm">
        <p className="text-white/60">
          {dictionary.appointments.empty.requests}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {appointments.map((appointment) => {
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

        const dateLabel = appointment.scheduledAt.toLocaleDateString(locale, {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        const timeLabel = appointment.scheduledAt.toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={appointment.id}
            className="flex flex-col rounded-2xl border border-[#2f2c28] bg-[#23201d] p-5 text-white shadow-sm"
          >
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
                {isVirtual && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <Wifi className="h-3.5 w-3.5 text-[#55eb55]" />
                    <span className="text-xs font-medium text-[#55eb55]">
                      {dictionary.appointments.card.online}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <MeetingUrlForm
                appointmentId={appointment.id}
                initialUrl={appointment.meetingUrl}
                dictionary={dictionary}
                variant="dark"
              />
            </div>

            <div className="mt-auto flex flex-wrap gap-2 pt-4">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleAction(appointment.id, "accept")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#55eb55] px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#45db45] disabled:opacity-60"
              >
                <Check className="h-4 w-4" />
                {dictionary.appointments.actions.accept}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleAction(appointment.id, "reject")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                {dictionary.appointments.actions.reject}
              </button>
            </div>
            {feedback?.id === appointment.id && (
              <p className="mt-2 text-sm text-rose-500">{feedback.error}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
