import { auth } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAppointmentDashboardCounts } from "@/lib/appointments";
import {
  Activity,
  Apple,
  CalendarDays,
  FileText,
  MessageSquare,
  User,
  Search,
} from "lucide-react";
import { OnboardingModal } from "./onboarding-modal";
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

  return (
    <div>
      {needsOnboarding && <OnboardingModal userId={userId} />}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          {dictionary.dashboard.patientTitle}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {dictionary.patientHome.welcome.replace(
            "{name}",
            session!.user.name || session!.user.email || ""
          )}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
            <Activity className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {dictionary.patientHome.currentWeight}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {patientProfile?.weight ? `${patientProfile.weight} kg` : "-- kg"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
            <Apple className="h-5 w-5 text-teal-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {dictionary.patientHome.caloriesToday}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0 kcal</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
            <CalendarDays className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {dictionary.patientHome.upcomingAppointments}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {upcomingAppointmentsCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
            <MessageSquare className="h-5 w-5 text-rose-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {dictionary.patientHome.messages}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {dictionary.patientHome.myRecord}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">{dictionary.patientHome.height}</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {patientProfile?.height
                  ? `${patientProfile.height} cm`
                  : dictionary.patientHome.notCompleted}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">{dictionary.patientHome.gender}</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 capitalize">
                {patientProfile?.gender
                  ? formatGender(patientProfile.gender, dictionary)
                  : dictionary.patientHome.notCompleted}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
                <FileText className="h-5 w-5 text-teal-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {dictionary.patientHome.documentsTitle}
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              {dictionary.patientHome.documentsDescription}
            </p>
          </div>
          <Link
            href="/paciente/dashboard/expertos"
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
                <Search className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {dictionary.patientHome.expertGuide}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {dictionary.patientHome.expertsDescription}
                </p>
              </div>
            </div>
            <svg
              className="h-5 w-5 text-slate-400"
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
