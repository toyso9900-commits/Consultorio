import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  Crown,
  Droplets,
  Dumbbell,
  Heart,
  MessageSquare,
  Moon,
  Ruler,
  Weight,
} from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type PatientProfile = {
  weight: number | null;
  height: number | null;
  gender: string | null;
  birthDate: Date | null;
  allergies: string | null;
  restrictions: string | null;
  goals: string | null;
};

type PatientHealthSummaryProps = {
  name: string;
  image: string | null;
  subscriptionStatus: "active" | "expired" | "none";
  registrationDate: Date;
  profile: PatientProfile | null;
  locale: string;
  dictionary: Dictionary["professionalClients"];
  messageHref: string;
  routineHref: string;
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

function computeAge(birthDate: Date | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

function computeBmi(
  weight: number | null,
  height: number | null
): number | null {
  if (!weight || !height || height <= 0) return null;
  return Number((weight / (height / 100) ** 2).toFixed(1));
}

export function PatientHealthSummary({
  name,
  image,
  subscriptionStatus,
  registrationDate,
  profile,
  locale,
  dictionary,
  messageHref,
  routineHref,
}: PatientHealthSummaryProps) {
  const displayName = name || dictionary.noName;
  const weight = profile?.weight ?? null;
  const height = profile?.height ?? null;
  const bmi = computeBmi(weight, height);
  const age = computeAge(profile?.birthDate ?? null);

  const hasActiveSubscription = subscriptionStatus === "active";

  const pillClasses = hasActiveSubscription
    ? "inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-400/20"
    : "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border";

  const meta = [
    {
      icon: Weight,
      label: dictionary.healthMetaWeight,
      value: weight ? `${weight} kg` : "--",
    },
    {
      icon: Activity,
      label: dictionary.healthMetaBmi,
      value: bmi ? String(bmi) : "--",
    },
    {
      icon: Ruler,
      label: dictionary.healthMetaHeight,
      value: height ? `${height} cm` : "--",
    },
    {
      icon: Heart,
      label: dictionary.healthMetaAge,
      value: age ? String(age) : "--",
    },
    {
      icon: Moon,
      label: dictionary.healthMetaSleep,
      value: "--",
    },
    {
      icon: Droplets,
      label: dictionary.healthMetaWater,
      value: "--",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-card-foreground">
        {dictionary.healthSummaryTitle.replace("{name}", displayName)}
      </h2>

      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500/20 to-violet-500/20 text-2xl font-bold text-foreground ring-1 ring-inset ring-border">
          {image ? (
            <Image
              src={image}
              alt=""
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          ) : (
            displayName.slice(0, 1).toUpperCase()
          )}
        </div>

        <div>
          <p className="text-lg font-semibold text-card-foreground">
            {displayName}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2">
            <span className={pillClasses}>
              <Crown className="h-3 w-3" />
              {hasActiveSubscription
                ? dictionary.activeSubscription
                : dictionary.noActiveSubscription}
            </span>
            <span className="text-xs text-muted-foreground">
              {dictionary.registrationDate}{" "}
              {formatPatientDate(registrationDate, locale)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {meta.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border/60 bg-muted/40 p-3 text-center"
          >
            <item.icon className="mx-auto h-5 w-5 text-emerald-500" />
            <p className="mt-1 text-sm font-semibold text-card-foreground">
              {item.value}
            </p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link
          href={messageHref}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_12px_rgba(124,58,237,0.35)] transition-colors hover:bg-violet-500"
        >
          <MessageSquare className="h-4 w-4" />
          {dictionary.sendMessage}
        </Link>
        <Link
          href={routineHref}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-colors hover:bg-emerald-500"
        >
          <Dumbbell className="h-4 w-4" />
          {dictionary.assignRoutine}
        </Link>
      </div>
    </div>
  );
}
