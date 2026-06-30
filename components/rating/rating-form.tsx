"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/lib/reviews";
import { useI18n } from "@/lib/i18n/client";

interface RatingFormProps {
  appointmentId: string;
  patientId: string;
  professionalName?: string | null;
  scheduledAt: Date;
  onSubmitted?: () => void;
}

export function RatingForm({
  appointmentId,
  patientId,
  professionalName,
  scheduledAt,
  onSubmitted,
}: RatingFormProps) {
  const { dictionary, locale } = useI18n();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const dateLabel = scheduledAt.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (rating < 1 || rating > 5) {
      setError(dictionary.rating.error);
      return;
    }

    startTransition(async () => {
      const result = await submitReview(
        appointmentId,
        patientId,
        rating,
        comment.trim() || undefined
      );

      if (result.success) {
        onSubmitted?.();
      } else {
        setError(dictionary.rating.submitError);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-slate-900"
    >
      <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        {dictionary.rating.appointmentLabel.replace(
          "{professional}",
          professionalName || dictionary.patientMessages.defaultName
        ).replace("{date}", dateLabel)}
      </p>

      <div className="mb-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={isPending}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="rounded p-0.5 transition-colors disabled:opacity-50"
            aria-label={dictionary.rating.starLabel.replace("{star}", String(star))}
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hoverRating || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-300 dark:text-slate-600"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={dictionary.rating.placeholder}
        disabled={isPending}
        className="mb-3 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        rows={2}
      />

      {error && (
        <p className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending || rating === 0}
        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
      >
        {isPending ? dictionary.common.sending : dictionary.rating.submit}
      </button>
    </form>
  );
}
