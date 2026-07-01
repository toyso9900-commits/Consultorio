import { auth } from "@/lib/auth";
import { MessageSquare, Star } from "lucide-react";
import { getReviewsForViewer } from "@/lib/reviews";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { StarRating } from "@/components/ui/star-rating";

export default async function ProfessionalReviewsPage() {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);
  const userId = session?.user?.id;
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  const isProfessional = role === "PROFESSIONAL";

  const reviews =
    userId && (isAdmin || isProfessional)
      ? await getReviewsForViewer(userId, isAdmin ? "ADMIN" : "PROFESSIONAL")
      : [];

  return (
    <div className="space-y-6" data-role={isAdmin ? "admin" : "professional"}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
          <Star className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {dictionary.adminReviews.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {isAdmin
              ? dictionary.adminReviews.adminSubtitle
              : dictionary.adminReviews.professionalSubtitle}
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <MessageSquare className="mx-auto mb-4 h-10 w-10 text-slate-300 dark:text-slate-700" />
          <p className="text-slate-600 dark:text-slate-400">
            {dictionary.adminReviews.emptyTitle}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {dictionary.adminReviews.emptySubtitle}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {(review.patient.name || "P").slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {review.patient.name || dictionary.adminReviews.noName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {review.comment || dictionary.adminReviews.noComment}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-1 sm:items-end">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {review.createdAt.toLocaleDateString(locale, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
