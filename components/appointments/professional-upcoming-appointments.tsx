"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ProfessionalAppointmentCard } from "./professional-appointment-card";
import {
  cancelAppointment,
  completeAppointment,
} from "@/app/profesional/dashboard/appointment-actions";
import type { AppointmentWithUsers } from "@/lib/appointments";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface ProfessionalUpcomingAppointmentsProps {
  appointments: AppointmentWithUsers[];
  locale: string;
  dictionary: Dictionary;
}

export function ProfessionalUpcomingAppointments({
  appointments,
  locale,
  dictionary,
}: ProfessionalUpcomingAppointmentsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ id: string; error: string } | null>(
    null
  );

  function handleAction(
    appointmentId: string,
    action: "cancel" | "complete"
  ) {
    const confirmationMessage =
      dictionary.appointments.confirmations[action];

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

  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border border-[#2f2c28] bg-[#23201d] p-12 text-center shadow-sm">
        <p className="text-white/60">
          {dictionary.appointments.empty.upcoming}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="space-y-3">
            <ProfessionalAppointmentCard
              appointment={appointment}
              locale={locale}
              dictionary={dictionary}
              onComplete={(id) => handleAction(id, "complete")}
              onCancel={(id) => handleAction(id, "cancel")}
              isPending={isPending}
            />
            {feedback?.id === appointment.id && (
              <p className="text-sm text-rose-500">{feedback.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
