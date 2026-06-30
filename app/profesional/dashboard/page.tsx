import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getAppointmentDashboardCounts,
  getAppointmentsThisWeekCount,
} from "@/lib/appointments";
import {
  BadgeCheck,
  CalendarDays,
  Crown,
  Users,
  ShieldCheck,
  ClipboardList,
  Briefcase,
  Star,
  Clock,
  Mail,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { AdminRealtimeListener } from "@/components/admin/admin-realtime-listener";
import { AdminStatsChart } from "@/components/admin/admin-stats-chart";
import { ValidationActions } from "@/components/admin/validation-actions";
import { getLocale, getDictionary } from "@/lib/i18n/server";

export default async function ProfessionalDashboardPage() {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);

  const role = session!.user.role;
  const isAdmin = role === "ADMIN";

  const professionalCount = await prisma.user.count({
    where: { role: "PROFESSIONAL" },
  });
  const pendingValidations = await prisma.professionalProfile.count({
    where: { isValidated: false, rejectedAt: null },
  });
  const activeSubscriptions = await prisma.subscription.count({
    where: { status: "ACTIVE" },
  });
  const appointmentsThisWeek = await getAppointmentsThisWeekCount();

  const pendingProfessionals = isAdmin
    ? await prisma.professionalProfile.findMany({
        where: { isValidated: false, rejectedAt: null },
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  if (isAdmin) {
    return (
      <div className="space-y-8">
        <AdminRealtimeListener />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <ShieldCheck className="h-4 w-4" />
              {dictionary.adminDashboard.adminBadge}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {dictionary.adminDashboard.title}
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              {dictionary.adminDashboard.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <TrendingUp className="h-4 w-4" />
            {dictionary.adminDashboard.pendingToday.replace(
              "{count}",
              String(pendingValidations)
            )}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              {dictionary.adminDashboard.registeredProfessionals}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {professionalCount}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
              <BadgeCheck className="h-5 w-5 text-amber-600" />
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              {dictionary.adminDashboard.pendingValidations}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {pendingValidations}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
              <Crown className="h-5 w-5 text-teal-600" />
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              {dictionary.adminDashboard.activeSubscriptions}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {activeSubscriptions}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
              <CalendarDays className="h-5 w-5 text-rose-600" />
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              {dictionary.adminDashboard.appointmentsThisWeek}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {appointmentsThisWeek}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {dictionary.adminDashboard.trafficAndRegistrations}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {dictionary.adminDashboard.last7Days}
                  </p>
                </div>
              </div>
            </div>
            <AdminStatsChart />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
                <BadgeCheck className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {dictionary.adminDashboard.waitingUsers}
              </h2>
            </div>

            {pendingProfessionals.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {dictionary.adminDashboard.noPendingProfessionals}
              </p>
            ) : (
              <ul className="space-y-3">
                {pendingProfessionals.slice(0, 5).map((prof) => (
                  <li
                    key={prof.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {prof.user.name || dictionary.adminDashboard.noName}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {prof.user.email}
                      </p>
                    </div>
                    <span className="ml-2 shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      {dictionary.adminDashboard.pendingStatus}
                    </span>
                  </li>
                ))}
                {pendingProfessionals.length > 5 && (
                  <li className="text-center text-sm text-slate-500 dark:text-slate-400">
                    {dictionary.adminDashboard.moreInValidations.replace(
                      "{count}",
                      String(pendingProfessionals.length - 5)
                    )}
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
              <BadgeCheck className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {dictionary.adminDashboard.validationsTitle}
            </h2>
          </div>

          {pendingProfessionals.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400">
              {dictionary.adminDashboard.noPendingProfessionals}
            </p>
          ) : (
            <div className="space-y-4">
              {pendingProfessionals.map((prof) => (
                <div
                  key={prof.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {prof.user.name || dictionary.adminDashboard.noName}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {prof.user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardList className="h-3.5 w-3.5" />
                        {dictionary.adminDashboard.licenseLabel}:{" "}
                        {prof.licenseNumber ||
                          dictionary.adminDashboard.licenseNotRegistered}
                      </span>
                    </div>
                  </div>
                  <ValidationActions profileId={prof.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const professional = await prisma.professionalProfile.findUnique({
    where: { userId: session!.user.id },
  });

  const { upcoming: upcomingAppointmentsCount, activePatients: activePatientsCount } =
    await getAppointmentDashboardCounts(session!.user.id!, "PROFESSIONAL");

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId: session!.user.id,
      status: "ACTIVE",
    },
  });

  const hasActiveSubscription = activeSubscription != null;

  const latestSubscription = activeSubscription
    ? activeSubscription
    : await prisma.subscription.findFirst({
        where: { userId: session!.user.id },
        orderBy: { createdAt: "desc" },
        take: 1,
      });

  return (
    <div>
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          <Briefcase className="h-4 w-4" />
          {dictionary.professionalDashboard.professionalBadge}
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          {dictionary.professionalDashboard.welcome.replace(
            "{name}",
            session!.user.name || session!.user.email || ""
          )}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {dictionary.professionalDashboard.subtitle}
        </p>
      </div>

      {!professional?.isValidated && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <p className="text-sm">
            {dictionary.professionalDashboard.pendingValidation}
          </p>
        </div>
      )}

      {!hasActiveSubscription && professional?.isValidated && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
          <p className="text-sm font-medium">
            {dictionary.professionalDashboard.subscriptionInactiveTitle}
          </p>
          <p className="mt-1 text-sm">
            {dictionary.professionalDashboard.subscriptionInactiveBody
              .split("{link}")
              .map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <Link
                      href="/profesional/dashboard/suscripcion"
                      className="underline hover:text-rose-900 dark:hover:text-rose-100"
                    >
                      {dictionary.professionalDashboard.subscribeLink}
                    </Link>
                  )}
                </span>
              ))}
          </p>
          {latestSubscription && (
            <p className="mt-2 text-xs opacity-80">
              {dictionary.professionalDashboard.subscriptionStatus
                .replace("{status}", latestSubscription.status.toLowerCase())
                .replace("{plan}", latestSubscription.plan.toLowerCase())}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
            <CalendarDays className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {dictionary.professionalDashboard.upcomingAppointments}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {upcomingAppointmentsCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
            <Users className="h-5 w-5 text-teal-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {dictionary.professionalDashboard.activePatients}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {activePatientsCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
            <Star className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {dictionary.professionalDashboard.ratings}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
            <Clock className="h-5 w-5 text-rose-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {dictionary.professionalDashboard.hoursThisWeek}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
              <Briefcase className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {dictionary.professionalDashboard.myProfessionalProfile}
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            {dictionary.professionalDashboard.licenseLabel}:{" "}
            {professional?.licenseNumber ||
              dictionary.professionalDashboard.licenseNotRegistered}.{" "}
            {dictionary.professionalDashboard.profileComingSoon}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
              <CalendarDays className="h-5 w-5 text-teal-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {dictionary.professionalDashboard.availability}
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            {dictionary.professionalDashboard.availabilityDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
