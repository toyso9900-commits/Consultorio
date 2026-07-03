import { auth } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAppointmentDashboardCounts } from "@/lib/appointments";
import { getWeightHistory } from "@/lib/weight";
import { getPendingReviewsForPatient } from "@/lib/reviews";
import { getTodayCalories } from "./nutricion/get-today-calories";
import {
  Activity,
  Apple,
  CalendarDays,
  FileText,
  MessageSquare,
  Search,
  TrendingDown,
  TrendingUp,
  Scale,
} from "lucide-react";
import { OnboardingModal } from "./onboarding-modal";
import { WeightEntryForm } from "./weight-entry-form";
import { WeightChart } from "@/components/dashboard/weight-chart";
import { RatingPrompt } from "@/components/rating/rating-prompt";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/server";

export default async function PatientDashboardPage() {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);

  const userId = session!.user.id!;

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId },
  });

  const { upcoming: upcomingAppointmentsCount } =
    await getAppointmentDashboardCounts(userId, "PATIENT");

  const needsOnboarding =
    !patientProfile ||
    !session!.user.name ||
    patientProfile.gender == null ||
    patientProfile.height == null ||
    patientProfile.weight == null;

  const weightHistory = patientProfile
    ? await getWeightHistory(patientProfile.id)
    : [];

  const pendingReviews = await getPendingReviewsForPatient(userId);

  const todayCalories = await getTodayCalories(userId);

  const weightChartData = weightHistory.map((entry) => ({
    date: entry.recordedAt.toISOString(),
    weight: entry.weight,
  }));

  const currentWeight = weightHistory.length > 0
    ? weightHistory[weightHistory.length - 1].weight
    : patientProfile?.weight ?? null;

  const previousWeight =
    weightHistory.length > 1 ? weightHistory[weightHistory.length - 2].weight : null;

  const weightTrend =
    currentWeight != null && previousWeight != null
      ? currentWeight - previousWeight
      : null;

  return (
    <div data-role="patient">
      {needsOnboarding && <OnboardingModal userId={userId} />}

      <RatingPrompt patientId={userId} pendingReviews={pendingReviews} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-card-foreground">
          {dictionary.dashboard.patientTitle}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {dictionary.patientHome.welcome.replace(
            "{name}",
            session!.user.name || session!.user.email || ""
          )}
        </p>
        <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          {dictionary.patientHome.wellnessSubtitle}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
            <Scale className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {dictionary.patientHome.currentWeight}
          </p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-card-foreground">
              {currentWeight ? `${currentWeight} kg` : "-- kg"}
            </p>
            {weightTrend != null && (
              <span
                className={`mb-1 flex items-center text-xs font-medium ${
                  weightTrend < 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {weightTrend < 0 ? (
                  <TrendingDown className="mr-0.5 h-3 w-3" />
                ) : (
                  <TrendingUp className="mr-0.5 h-3 w-3" />
                )}
                {Math.abs(weightTrend).toFixed(1)} kg
              </span>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
            <Apple className="h-5 w-5 text-teal-600" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {dictionary.patientHome.caloriesToday}
          </p>
          <p className="text-2xl font-bold text-card-foreground">
            {todayCalories} kcal
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
            <CalendarDays className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {dictionary.patientHome.upcomingAppointments}
          </p>
          <p className="text-2xl font-bold text-card-foreground">
            {upcomingAppointmentsCount}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
            <MessageSquare className="h-5 w-5 text-rose-600" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {dictionary.patientHome.messages}
          </p>
          <p className="text-2xl font-bold text-card-foreground">0</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-card-foreground">
                {dictionary.patientHome.myRecord}
              </h2>
            </div>
            {patientProfile && (
              <WeightEntryForm
                patientProfileId={patientProfile.id}
                dictionary={dictionary}
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                {dictionary.patientHome.height}
              </p>
              <p className="text-lg font-semibold text-card-foreground">
                {patientProfile?.height
                  ? `${patientProfile.height} cm`
                  : dictionary.patientHome.notCompleted}
              </p>
            </div>
            <div className="rounded-xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                {dictionary.patientHome.gender}
              </p>
              <p className="text-lg font-semibold text-card-foreground capitalize">
                {patientProfile?.gender
                  ? formatGender(patientProfile.gender, dictionary)
                  : dictionary.patientHome.notCompleted}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-card-foreground">
              {dictionary.patientHome.weightHistory}
            </h3>
            {weightChartData.length > 0 ? (
              <WeightChart data={weightChartData} />
            ) : (
              <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                {dictionary.patientHome.weightEmpty}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
                <FileText className="h-5 w-5 text-teal-600" />
              </div>
              <h2 className="text-lg font-semibold text-card-foreground">
                {dictionary.patientHome.documentsTitle}
              </h2>
            </div>
            <p className="text-muted-foreground">
              {dictionary.patientHome.documentsDescription}
            </p>
          </div>
          <Link
            href="/paciente/dashboard/expertos"
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md dark:hover:border-emerald-800"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                <Search className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  {dictionary.patientHome.expertGuide}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {dictionary.patientHome.expertsDescription}
                </p>
              </div>
            </div>
            <svg
              className="h-5 w-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

function formatGender(value: string, dictionary: Dictionary) {
  const map: Record<string, string> = {
    male: dictionary.gender.male,
    female: dictionary.gender.female,
    "non-binary": dictionary.gender.nonBinary,
    "prefer-not-to-say": dictionary.gender.preferNotToSay,
  };
  return map[value] || value;
}
