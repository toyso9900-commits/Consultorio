"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { RatingForm } from "./rating-form";
import { useI18n } from "@/lib/i18n/client";

interface PendingReview {
  id: string;
  scheduledAt: Date;
  professional: { id: string; name: string | null; image: string | null };
}

interface RatingPromptProps {
  patientId: string;
  pendingReviews: PendingReview[];
}

export function RatingPrompt({ patientId, pendingReviews }: RatingPromptProps) {
  const { dictionary } = useI18n();
  const [dismissed, setDismissed] = useState(false);
  const [reviews, setReviews] = useState(pendingReviews);

  if (dismissed || reviews.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
            {dictionary.rating.title}
          </h3>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            {dictionary.rating.description}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1 text-emerald-600 transition-colors hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900"
          aria-label={dictionary.common.close}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {reviews.map((appointment) => (
          <RatingForm
            key={appointment.id}
            appointmentId={appointment.id}
            patientId={patientId}
            professionalName={appointment.professional.name}
            scheduledAt={appointment.scheduledAt}
            onSubmitted={() =>
              setReviews((prev) => prev.filter((r) => r.id !== appointment.id))
            }
          />
        ))}
      </div>
    </div>
  );
}
