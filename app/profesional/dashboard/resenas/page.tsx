import { auth } from "@/lib/auth";
import { MessageSquare, Star, User } from "lucide-react";
import { getAdminReviews, getProfessionalReviews } from "@/lib/reviews";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { StarRating } from "@/components/ui/star-rating";
import type { Dictionary } from "@/lib/i18n/server";
import type { ReviewListItem } from "@/lib/reviews";

interface ReviewSectionProps {
  title: string;
  reviews: ReviewListItem[];
  emptyTitle: string;
  emptySubtitle: string;
  dictionary: Dictionary;
  locale: string;
  showProfessional?: boolean;
}

function ReviewSection({
  title,
  reviews,
  emptyTitle,
  emptySubtitle,
  dictionary,
  locale,
  showProfessional = false,
}: ReviewSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-card-foreground">
        {title}
        {reviews.length > 0 && (
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-sm text-muted-foreground">
            {reviews.length}
          </span>
        )}
      </h2>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <MessageSquare className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">{emptyTitle}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {emptySubtitle}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <ul className="divide-y divide-border">
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
                    <p className="font-medium text-card-foreground">
                      {review.patient.name || dictionary.adminReviews.noName}
                    </p>
                    {showProfessional && review.professional && (
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        {dictionary.adminReviews.professionalLabel}:{" "}
                        {review.professional.name ||
                          dictionary.adminReviews.noName}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {review.comment || dictionary.adminReviews.noComment}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-1 sm:items-end">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-sm text-muted-foreground">
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
    </section>
  );
}

export default async function ProfessionalReviewsPage() {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);
  const userId = session?.user?.id;
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  const isProfessional = role === "PROFESSIONAL";

  let platformReviews: ReviewListItem[] = [];
  let professionalReviews: ReviewListItem[] = [];

  if (userId && isAdmin) {
    const adminReviews = await getAdminReviews();
    platformReviews = adminReviews.platformReviews;
    professionalReviews = adminReviews.professionalReviews;
  } else if (userId && isProfessional) {
    professionalReviews = await getProfessionalReviews(userId);
  }

  const canAccess = isAdmin || isProfessional;

  return (
    <div className="space-y-8" data-role={isAdmin ? "admin" : "professional"}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
          <Star className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">
            {dictionary.adminReviews.title}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? dictionary.adminReviews.adminSubtitle
              : dictionary.adminReviews.professionalSubtitle}
          </p>
        </div>
      </div>

      {!canAccess ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">
            {dictionary.errors.unauthorized}
          </p>
        </div>
      ) : isAdmin ? (
        <div className="space-y-8">
          <ReviewSection
            title={dictionary.adminReviews.platformReviewsTitle}
            reviews={platformReviews}
            emptyTitle={dictionary.adminReviews.emptyPlatformTitle}
            emptySubtitle={dictionary.adminReviews.emptyPlatformSubtitle}
            dictionary={dictionary}
            locale={locale}
          />
          <ReviewSection
            title={dictionary.adminReviews.professionalReviewsTitle}
            reviews={professionalReviews}
            emptyTitle={dictionary.adminReviews.emptyProfessionalTitle}
            emptySubtitle={dictionary.adminReviews.emptyProfessionalSubtitle}
            dictionary={dictionary}
            locale={locale}
            showProfessional
          />
        </div>
      ) : (
        <ReviewSection
          title={dictionary.adminReviews.professionalReviewsTitle}
          reviews={professionalReviews}
          emptyTitle={dictionary.adminReviews.emptyTitle}
          emptySubtitle={dictionary.adminReviews.emptySubtitle}
          dictionary={dictionary}
          locale={locale}
        />
      )}
    </div>
  );
}
