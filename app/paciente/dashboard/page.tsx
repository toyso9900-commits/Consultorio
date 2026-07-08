import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getAppointmentDashboardCounts } from "@/lib/appointments";
import { getWeightHistory } from "@/lib/weight";
import { getPendingReviewsForPatient } from "@/lib/reviews";
import { getTodayMacros } from "./nutricion/get-today-macros";
import { CalorieDonut } from "@/components/dashboard/calorie-donut";
import { WeightChart } from "@/components/dashboard/weight-chart";
import { OnboardingModal } from "./onboarding-modal";
import { WeightEntryForm } from "./weight-entry-form";
import { RatingPrompt } from "@/components/rating/rating-prompt";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/server";
import {
  Search,
  Bell,
  UserCircle,
  CalendarDays,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Utensils,
} from "lucide-react";

export default async function PatientDashboardPage() {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);

  const userId = session!.user.id!;
  const userName = session!.user.name || session!.user.email || "";
  const firstName = userName.split(" ")[0] || userName;

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

  const todayMacros = await getTodayMacros(userId);

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

  const upcomingAppointment = await prisma.appointment.findFirst({
    where: {
      patientId: userId,
      status: { in: ["REQUESTED", "CONFIRMED"] },
      scheduledAt: { gte: new Date() },
    },
    include: {
      professional: { select: { name: true, image: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const experts = await prisma.professionalProfile.findMany({
    where: { isValidated: true },
    include: { user: { select: { id: true, name: true, image: true } } },
    take: 4,
  });

  const recentMessages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const today = new Date();
  const formattedDate = today.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const recentActivities = [
    {
      icon: Activity,
      label: dictionary.patientHome.weightLogged,
      time: "08:30",
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    },
    {
      icon: CalendarDays,
      label: dictionary.patientHome.appointmentConfirmed,
      time: "Ayer",
      color: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    },
    {
      icon: Utensils,
      label: dictionary.patientHome.mealLogged,
      time: "Hace 2 días",
      color: "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400",
    },
  ];

  return (
    <div data-role="patient" className="space-y-8">
      {needsOnboarding && <OnboardingModal userId={userId} />}
      <RatingPrompt patientId={userId} pendingReviews={pendingReviews} />

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground dark:text-stone-400">
            {formattedDate}
          </p>
          <h1 className="text-2xl font-bold text-foreground dark:text-stone-100 sm:text-3xl">
            {dictionary.patientHome.greeting.replace("{name}", firstName)}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-stone-400" />
            <input
              type="text"
              placeholder={dictionary.common.search}
              className="h-10 w-56 rounded-full bg-card pl-9 pr-4 text-sm text-foreground shadow-sm outline-none ring-1 ring-border placeholder:text-muted-foreground dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700"
            />
          </div>
          <button
            type="button"
            className="relative rounded-full bg-card p-2.5 shadow-sm ring-1 ring-border dark:bg-stone-800 dark:ring-stone-700"
            aria-label={dictionary.common.notifications}
          >
            <Bell className="h-5 w-5 text-muted-foreground dark:text-stone-300" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
          </button>
          <div className="flex items-center gap-2 rounded-full bg-card p-1 pr-3 shadow-sm ring-1 ring-border dark:bg-stone-800 dark:ring-stone-700">
            <div className="h-9 w-9 overflow-hidden rounded-full bg-emerald-100">
              {session!.user.image ? (
                <Image
                  src={session!.user.image}
                  alt=""
                  width={36}
                  height={36}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <UserCircle className="h-9 w-9 text-emerald-600" />
              )}
            </div>
            <span className="hidden text-sm font-medium text-foreground dark:text-stone-200 md:block">
              {firstName}
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-card p-6 shadow-sm dark:bg-stone-800">
          <h2 className="mb-2 text-lg font-semibold text-foreground dark:text-stone-100">
            Meta de Calorías Hoy
          </h2>
          <CalorieDonut calories={todayMacros.calories} goal={2000} />
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-sm dark:bg-stone-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground dark:text-stone-100">
              {dictionary.patientHome.nextAppointment}
            </h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {upcomingAppointmentsCount} {dictionary.patientHome.upcomingAppointments.toLowerCase()}
            </span>
          </div>
          {upcomingAppointment ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-emerald-100">
                  {upcomingAppointment.professional.image ? (
                    <Image
                      src={upcomingAppointment.professional.image}
                      alt=""
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserCircle className="h-12 w-12 text-emerald-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground dark:text-stone-100">
                    {upcomingAppointment.professional.name || dictionary.adminDashboard.noName}
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-stone-400">
                    {dictionary.patientHome.nutritionist}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted p-3 dark:bg-stone-700/30">
                  <p className="text-xs text-muted-foreground dark:text-stone-400">{dictionary.patientHome.date}</p>
                  <p className="font-semibold text-foreground dark:text-stone-100">
                    {upcomingAppointment.scheduledAt.toLocaleDateString(locale, {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <div className="rounded-xl bg-muted p-3 dark:bg-stone-700/30">
                  <p className="text-xs text-muted-foreground dark:text-stone-400">{dictionary.patientHome.time}</p>
                  <p className="font-semibold text-foreground dark:text-stone-100">
                    {upcomingAppointment.scheduledAt.toLocaleTimeString(locale, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center rounded-xl bg-muted text-center dark:bg-stone-700/30">
              <CalendarDays className="h-8 w-8 text-muted-foreground dark:text-stone-400" />
              <p className="mt-2 text-sm text-muted-foreground dark:text-stone-400">
                {dictionary.patientHome.noAppointments}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-sm dark:bg-stone-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground dark:text-stone-100">
              {dictionary.patientHome.photos}
            </h2>
            <Link
              href="/paciente/dashboard/nutricion"
              className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              {dictionary.patientHome.viewAll}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
                <Image
                  src="https://placehold.co/400x500/e7e5e4/78716c?text=Hace+1+mes"
                  alt="Hace 1 mes"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-center text-xs text-muted-foreground dark:text-stone-400">
                {dictionary.patientHome.monthAgo}
              </p>
            </div>
            <div className="space-y-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
                <Image
                  src="https://placehold.co/400x500/d1fae5/065f46?text=Hoy"
                  alt="Hoy"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-center text-xs text-muted-foreground dark:text-stone-400">
                {dictionary.patientHome.today}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-sm dark:bg-stone-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground dark:text-stone-100">
              {dictionary.patientHome.expertGuide}
            </h2>
            <Link
              href="/paciente/dashboard/expertos"
              className="rounded-full bg-emerald-100 p-2 text-emerald-600 transition-colors hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-800/40"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {experts.length === 0 ? (
            <p className="text-sm text-muted-foreground dark:text-stone-400">
              {dictionary.patientExperts.noResults}
            </p>
          ) : (
            <ul className="space-y-3">
              {experts.map((expert) => (
                <li
                  key={expert.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-muted p-3 dark:bg-stone-700/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-emerald-100">
                      {expert.user.image ? (
                        <Image
                          src={expert.user.image}
                          alt=""
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserCircle className="h-10 w-10 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground dark:text-stone-100">
                        {expert.user.name || dictionary.adminDashboard.noName}
                      </p>
                      <p className="text-xs text-muted-foreground dark:text-stone-400 capitalize">
                        {specialtyLabel(expert.specialty, dictionary)}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/paciente/dashboard/mensajes?to=${expert.user.id}`}
                    className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                  >
                    {dictionary.patientHome.contact}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-sm dark:bg-stone-800">
          <h2 className="mb-4 text-lg font-semibold text-foreground dark:text-stone-100">
            {dictionary.patientHome.recentActivity}
          </h2>
          <ul className="space-y-4">
            {recentActivities.map((activity, index) => (
              <li key={index} className="flex gap-3">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${activity.color}`}
                  >
                    <activity.icon className="h-5 w-5" />
                  </div>
                  {index !== recentActivities.length - 1 && (
                    <div className="mt-1 h-full w-px bg-border dark:bg-stone-700" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="font-medium text-foreground dark:text-stone-100">
                    {activity.label}
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-stone-400">
                    {activity.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-sm dark:bg-stone-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground dark:text-stone-100">
              {dictionary.patientHome.messages}
            </h2>
            <Link
              href="/paciente/dashboard/mensajes"
              className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              {dictionary.patientHome.viewAll}
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-xl bg-muted text-center dark:bg-stone-700/30">
              <MessageSquare className="h-8 w-8 text-muted-foreground dark:text-stone-400" />
              <p className="mt-2 text-sm text-muted-foreground dark:text-stone-400">
                {dictionary.patientHome.noMessages}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentMessages.map((message) => {
                const partner =
                  message.senderId === userId ? message.receiver : message.sender;
                return (
                  <li
                    key={message.id}
                    className="flex items-center gap-3 rounded-xl bg-muted p-3 dark:bg-stone-700/30"
                  >
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-emerald-100">
                      {partner.image ? (
                        <Image
                          src={partner.image}
                          alt=""
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserCircle className="h-10 w-10 text-emerald-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground dark:text-stone-100">
                        {partner.name || dictionary.adminDashboard.noName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground dark:text-stone-400">
                        {message.content}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground dark:text-stone-400">
                      {message.createdAt.toLocaleTimeString(locale, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-sm dark:bg-stone-800">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-foreground dark:text-stone-100">
              {dictionary.patientHome.weightHistory}
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
          <div className="rounded-xl bg-muted p-4 dark:bg-stone-700/30">
            <p className="text-sm text-muted-foreground dark:text-stone-400">
              {dictionary.patientHome.currentWeight}
            </p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-foreground dark:text-stone-100">
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
          <div className="rounded-xl bg-muted p-4 dark:bg-stone-700/30">
            <p className="text-sm text-muted-foreground dark:text-stone-400">
              {dictionary.patientHome.height}
            </p>
            <p className="text-lg font-semibold text-foreground dark:text-stone-100">
              {patientProfile?.height
                ? `${patientProfile.height} cm`
                : dictionary.patientHome.notCompleted}
            </p>
          </div>
        </div>

        <div className="mt-6">
          {weightChartData.length > 0 ? (
            <WeightChart data={weightChartData} />
          ) : (
            <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground dark:bg-stone-700/30 dark:text-stone-400">
              {dictionary.patientHome.weightEmpty}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function specialtyLabel(value: string, dictionary: Dictionary) {
  const map: Record<string, string> = {
    NUTRITION: dictionary.patientExperts.specialties.nutrition,
    TRAINING: dictionary.patientExperts.specialties.training,
    BOTH: dictionary.patientExperts.specialties.both,
  };
  return map[value] || value;
}
