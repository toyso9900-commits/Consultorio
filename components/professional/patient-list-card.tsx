import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Crown, Camera, MessageSquare } from "lucide-react";
import type { ProfessionalClient } from "@/lib/appointments";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type PatientListCardProps = {
  client: ProfessionalClient;
  locale: string;
  dictionary: Dictionary["professionalClients"];
  isSelected: boolean;
  recordsHref: string;
  messageHref: string;
};

function formatPatientDate(date: Date, locale: string): string {
  if (locale === "en") {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const months = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function PatientListCard({
  client,
  locale,
  dictionary,
  isSelected,
  recordsHref,
  messageHref,
}: PatientListCardProps) {
  const initials = (client.name || "P").slice(0, 1).toUpperCase();
  const hasActiveSubscription = client.subscriptionStatus === "active";

  const cardClasses = isSelected
    ? "relative rounded-2xl border border-emerald-400/40 bg-card/80 p-4 shadow-[0_0_20px_rgba(52,211,153,0.28),0_0_45px_rgba(167,139,250,0.18)] ring-1 ring-inset ring-emerald-300/30 backdrop-blur-sm transition-all"
    : "relative rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-border/80 hover:shadow-md";

  const pillClasses = hasActiveSubscription
    ? "inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-400/20"
    : "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border";

  return (
    <div className={cardClasses} data-selected={isSelected || undefined}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500/20 to-violet-500/20 text-base font-bold text-foreground ring-1 ring-inset ring-border">
            {client.image ? (
              <Image
                src={client.image}
                alt=""
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-card-foreground">
              {client.name || dictionary.noName}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {client.lastAppointment
                  ? formatPatientDate(client.lastAppointment, locale)
                  : dictionary.noAppointment}
              </span>
              <span className={pillClasses}>
                <Crown className="h-3 w-3" />
                {hasActiveSubscription
                  ? dictionary.activeSubscription
                  : dictionary.noActiveSubscription}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Link
            href={recordsHref}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-colors hover:bg-emerald-500 sm:flex-none"
          >
            <Camera className="h-4 w-4" />
            {dictionary.viewData}
          </Link>
          <Link
            href={messageHref}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_12px_rgba(124,58,237,0.35)] transition-colors hover:bg-violet-500 sm:flex-none"
          >
            <MessageSquare className="h-4 w-4" />
            {dictionary.message}
          </Link>
        </div>
      </div>
    </div>
  );
}
