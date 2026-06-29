import { auth } from "@/lib/auth";
import { MessageSquare, Star } from "lucide-react";
import { getLocale, getDictionary } from "@/lib/i18n/server";

export default async function AdminReviewsPage() {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="space-y-6">
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

      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <MessageSquare className="mx-auto mb-4 h-10 w-10 text-slate-300 dark:text-slate-700" />
        <p className="text-slate-600 dark:text-slate-400">
          {dictionary.adminReviews.emptyTitle}
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {dictionary.adminReviews.emptySubtitle}
        </p>
      </div>
    </div>
  );
}
