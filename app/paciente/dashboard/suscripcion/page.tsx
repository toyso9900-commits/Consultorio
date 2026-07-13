import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCard } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { CancelSubscriptionButton } from "./cancel-button";

type DisplayStatus = "active" | "cancelled" | "expired";

function computeDisplayStatus(
  status: "ACTIVE" | "CANCELLED" | "EXPIRED",
  expiresAt: Date,
  now: Date
): DisplayStatus {
  if (status === "EXPIRED" || expiresAt <= now) return "expired";
  if (status === "CANCELLED") return "cancelled";
  return "active";
}

const statusBadgeClass: Record<DisplayStatus, string> = {
  active:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  cancelled:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  expired: "bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
};

export default async function PatientSubscriptionsPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "PATIENT") {
    redirect("/login");
  }

  const patientId = session.user.id;
  const locale = await getLocale(patientId);
  const dictionary = await getDictionary(locale);

  const subscriptions = await prisma.patientSubscription.findMany({
    where: { patientId },
    include: {
      professional: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const t = dictionary.patientSubscription;

  const statusLabel: Record<DisplayStatus, string> = {
    active: t.statusActive,
    cancelled: t.statusCancelled,
    expired: t.statusExpired,
  };

  return (
    <div className="space-y-6" data-role="patient">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
          <CreditCard className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">{t.empty}</p>
          <Link
            href="/paciente/dashboard/expertos"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            {t.browseExperts}
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {subscriptions.map((sub) => {
            const display = computeDisplayStatus(sub.status, sub.expiresAt, now);
            const canCancel = display === "active";

            return (
              <li
                key={sub.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-card-foreground">
                        {sub.professional.name ?? t.professionalLabel}
                      </h2>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass[display]}`}
                      >
                        {statusLabel[display]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t.priceLabel}:{" "}
                      <span className="font-medium text-foreground">
                        ${sub.pricePaid} {sub.currency}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t.expiresLabel}:{" "}
                      <span className="font-medium text-foreground">
                        {sub.expiresAt.toLocaleDateString(locale)}
                      </span>
                    </p>
                  </div>
                  <CancelSubscriptionButton
                    professionalId={sub.professionalId}
                    disabled={!canCancel}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
