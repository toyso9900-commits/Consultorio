import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppointmentDashboardCounts } from "@/lib/appointments";
import {
  CalendarDays,
  Crown,
  ShieldCheck,
  ClipboardList,
  Star,
  Search,
  Bell,
  UserCircle,
  MessageSquare,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AdminRealtimeListener } from "@/components/admin/admin-realtime-listener";
import { SubscriptionDonut } from "@/components/dashboard/subscription-donut";
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

  const pendingProfessionals = isAdmin
    ? await prisma.professionalProfile.findMany({
        where: { isValidated: false, rejectedAt: null },
        include: { user: { select: { id: true, email: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const reviewsToModerate = isAdmin
    ? await prisma.review.findMany({
        include: {
          patient: { select: { id: true, name: true, image: true } },
          professional: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    : [];

  const totalUsers = isAdmin ? await prisma.user.count() : 0;
  const freeSubscriptions = isAdmin
    ? await prisma.subscription.count({ where: { plan: "FREE" } })
    : 0;
  const premiumSubscriptions = isAdmin
    ? await prisma.subscription.count({ where: { plan: "PREMIUM" } })
    : 0;
  const totalReviews = isAdmin ? await prisma.review.count() : 0;

  if (isAdmin) {
    return (
      <div data-role="admin" className="space-y-8">
        <AdminRealtimeListener />

        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              {dictionary.adminDashboard.adminGlobal}
            </div>
            <h1 className="text-2xl font-bold text-foreground dark:text-stone-100 sm:text-3xl">
              {dictionary.adminDashboard.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-stone-400" />
              <input
                type="text"
                placeholder={dictionary.adminDashboard.globalSearch}
                className="h-10 w-56 rounded-full bg-card pl-9 pr-4 text-sm text-foreground shadow-sm outline-none ring-1 ring-border placeholder:text-muted-foreground dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700"
              />
            </div>
            <button
              type="button"
              className="relative rounded-full bg-card p-2.5 shadow-sm ring-1 ring-border dark:bg-stone-800 dark:ring-stone-700"
              aria-label={dictionary.common.notifications}
            >
              <Bell className="h-5 w-5 text-muted-foreground dark:text-stone-300" />
              {pendingValidations > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm dark:border-stone-700/50 dark:bg-stone-800/80">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground dark:text-stone-100">
                {dictionary.adminDashboard.criticalValidations}
              </h2>
              <Link
                href="/profesional/dashboard/validaciones"
                className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              >
                {dictionary.landing.viewAll}
              </Link>
            </div>
            {pendingProfessionals.length === 0 ? (
              <p className="text-sm text-muted-foreground dark:text-stone-400">
                {dictionary.adminDashboard.noPendingProfessionals}
              </p>
            ) : (
              <ul className="space-y-3">
                {pendingProfessionals.slice(0, 4).map((prof) => (
                  <li
                    key={prof.id}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-muted p-4 sm:flex-row sm:items-center sm:justify-between dark:border-stone-700/50 dark:bg-stone-700/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-emerald-100">
                        {prof.user.image ? (
                          <Image
                            src={prof.user.image}
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
                        <p className="font-semibold text-foreground dark:text-stone-100">
                          {prof.user.name || dictionary.adminDashboard.noName}
                        </p>
                        <p className="text-sm text-muted-foreground dark:text-stone-400">
                          {prof.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        {dictionary.adminDashboard.pendingStatus}
                      </span>
                      <Link
                        href={`/profesional/dashboard/validaciones?profile=${prof.id}`}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                      >
                        {dictionary.adminDashboard.verify}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm dark:border-stone-700/50 dark:bg-stone-800/80">
            <h2 className="mb-4 text-lg font-semibold text-foreground dark:text-stone-100">
              {dictionary.adminDashboard.globalMetrics}
            </h2>
            <div className="space-y-4">
              <MetricItem
                label={dictionary.adminDashboard.totalUsers}
                value={totalUsers}
                trend="+12%"
                positive
              />
              <MetricItem
                label={dictionary.adminDashboard.professionals}
                value={professionalCount}
                trend="+5%"
                positive
              />
              <MetricItem
                label={dictionary.adminDashboard.revenue}
                value={`$${premiumSubscriptions * 50}`}
                trend="+8%"
                positive
              />
              <MetricItem
                label={dictionary.adminDashboard.reviews}
                value={totalReviews}
                trend="-2%"
                positive={false}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm dark:border-stone-700/50 dark:bg-stone-800/80">
            <h2 className="mb-4 text-lg font-semibold text-foreground dark:text-stone-100">
              {dictionary.adminDashboard.reviewsToModerate}
            </h2>
            {reviewsToModerate.length === 0 ? (
              <p className="text-sm text-muted-foreground dark:text-stone-400">
                {dictionary.adminReviews.emptyTitle}
              </p>
            ) : (
              <ul className="space-y-3">
                {reviewsToModerate.map((review) => (
                  <li
                    key={review.id}
                    className="rounded-xl border border-border bg-muted p-4 dark:border-stone-700/50 dark:bg-stone-700/30"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating
                                ? "fill-current"
                                : "text-muted-foreground dark:text-stone-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground dark:text-stone-400">
                        {review.patient.name || dictionary.adminDashboard.noName}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-foreground dark:text-stone-200">
                      {review.comment || dictionary.adminReviews.noComment}
                    </p>
                    <button
                      type="button"
                      className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-muted/80 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
                    >
                      {dictionary.adminDashboard.moderate}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm dark:border-stone-700/50 dark:bg-stone-800/80">
            <h2 className="mb-4 text-lg font-semibold text-foreground dark:text-stone-100">
              {dictionary.adminDashboard.systemActivity}
            </h2>
            <ul className="space-y-4">
            {[
              { label: dictionary.adminDashboard.activityNewProfessional, count: 10 },
              { label: dictionary.adminDashboard.activityValidationApproved, count: 25 },
              { label: dictionary.adminDashboard.activityPremiumActivated, count: 60 },
              { label: dictionary.adminDashboard.activityReviewReported, count: 120 },
            ].map((event, index, arr) => (
              <li key={index} className="flex gap-3">
                <div className="relative flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  {index !== arr.length - 1 && (
                    <div className="mt-1 h-full w-px bg-border dark:bg-stone-700" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-foreground dark:text-stone-100">
                    {event.label}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-stone-400">
                    {event.count < 60
                      ? dictionary.adminDashboard.minutesAgo.replace("{count}", String(event.count))
                      : dictionary.adminDashboard.hoursAgo.replace("{count}", String(Math.floor(event.count / 60)))}
                  </p>
                </div>
              </li>
            ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm dark:border-stone-700/50 dark:bg-stone-800/80">
            <h2 className="mb-4 text-lg font-semibold text-foreground dark:text-stone-100">
              {dictionary.adminDashboard.globalSubscriptions}
            </h2>
            <SubscriptionDonut
              free={freeSubscriptions}
              premium={premiumSubscriptions}
              totalLabel={dictionary.adminSubscriptions.title.toLowerCase()}
            />
            <div className="mt-4 flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-muted-foreground dark:bg-stone-400" />
                <span className="text-muted-foreground dark:text-stone-400">
                  {dictionary.adminDashboard.freePlan} ({freeSubscriptions})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-accent-blue dark:bg-emerald-500" />
                <span className="text-muted-foreground dark:text-stone-400">
                  {dictionary.adminDashboard.premiumPlan} ({premiumSubscriptions})
                </span>
              </div>
            </div>
          </div>
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

  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const endOfDay = new Date(now.setHours(23, 59, 59, 999));

  const todaysAppointments = await prisma.appointment.findMany({
    where: {
      professionalId: session!.user.id,
      scheduledAt: { gte: startOfDay, lte: endOfDay },
      status: { not: "CANCELLED" },
    },
    include: {
      patient: { select: { id: true, name: true, image: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const recentMessages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: session!.user.id }, { receiverId: session!.user.id }],
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weeklyAppointments = await prisma.appointment.findMany({
    where: {
      professionalId: session!.user.id,
      scheduledAt: { gte: weekStart, lte: weekEnd },
      status: { not: "CANCELLED" },
    },
    select: { scheduledAt: true, status: true },
  });

  const userName = session!.user.name || session!.user.email || "";
  const firstName = userName.split(" ")[0] || userName;

  return (
    <div data-role="professional" className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground dark:text-stone-100 sm:text-3xl">
            {dictionary.professionalDashboard.greeting.replace("{name}", firstName)}
          </h1>
          <p className="mt-1 text-emerald-600 dark:text-emerald-400">
            {dictionary.professionalDashboard.businessSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-stone-400" />
            <input
              type="text"
              placeholder={dictionary.common.search}
              className="h-10 w-56 rounded-full bg-card/10 pl-9 pr-4 text-sm text-foreground shadow-sm outline-none ring-1 ring-border placeholder:text-muted-foreground dark:bg-stone-800/50 dark:text-stone-200 dark:ring-stone-700"
            />
          </div>
          <button
            type="button"
            className="relative rounded-full bg-card/10 p-2.5 shadow-sm ring-1 ring-border dark:bg-stone-800/50 dark:ring-stone-700"
            aria-label={dictionary.common.notifications}
          >
            <Bell className="h-5 w-5 text-muted-foreground dark:text-stone-300" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
          </button>
          <div className="flex items-center gap-2 rounded-full bg-card/10 p-1 pr-3 shadow-sm ring-1 ring-border dark:bg-stone-800/50 dark:ring-stone-700">
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

      {!professional?.isValidated && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <p className="text-sm">{dictionary.professionalDashboard.pendingValidation}</p>
        </div>
      )}

      {!hasActiveSubscription && professional?.isValidated && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-card p-6 shadow-sm dark:bg-stone-800/80">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground dark:text-stone-100">
              {dictionary.professionalDashboard.todaysAppointments}
            </h2>
            <Link
              href="/profesional/dashboard/citas"
              className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              {dictionary.landing.viewAll}
            </Link>
          </div>
          {todaysAppointments.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-xl bg-muted text-center dark:bg-stone-700/30">
              <CalendarDays className="h-8 w-8 text-muted-foreground dark:text-stone-400" />
              <p className="mt-2 text-sm text-muted-foreground dark:text-stone-400">
                {dictionary.appointments.empty.professional}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {todaysAppointments.map((appointment) => (
                <li
                  key={appointment.id}
                  className="flex items-center justify-between rounded-xl bg-muted p-3 dark:bg-stone-700/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-emerald-100">
                      {appointment.patient.image ? (
                        <Image
                          src={appointment.patient.image}
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
                      <p className="font-semibold text-foreground dark:text-stone-100">
                        {appointment.patient.name || dictionary.adminDashboard.noName}
                      </p>
                      <p className="text-xs text-muted-foreground dark:text-stone-400">
                        {appointment.scheduledAt.toLocaleTimeString(locale, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/profesional/dashboard/clientes?patient=${appointment.patient.id}`}
                    className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                  >
                    {dictionary.professionalDashboard.viewProfile}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-sm dark:bg-stone-800/80">
          <h2 className="mb-4 text-lg font-semibold text-foreground dark:text-stone-100">
            {dictionary.professionalDashboard.practiceSummary}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-muted p-4 dark:bg-stone-700/30">
              <p className="text-xs text-muted-foreground dark:text-stone-400">
                {dictionary.professionalDashboard.activeClients}
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground dark:text-stone-100">
                {activePatientsCount}
              </p>
              <p className="mt-1 flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="mr-0.5 h-3 w-3" />
                +4%
              </p>
            </div>
            <div className="rounded-xl bg-muted p-4 dark:bg-stone-700/30">
              <p className="text-xs text-muted-foreground dark:text-stone-400">
                {dictionary.professionalDashboard.newClients}
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground dark:text-stone-100">
                {upcomingAppointmentsCount}
              </p>
              <p className="mt-1 flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="mr-0.5 h-3 w-3" />
                +12%
              </p>
            </div>
            <div className="rounded-xl bg-muted p-4 dark:bg-stone-700/30">
              <p className="text-xs text-muted-foreground dark:text-stone-400">
                {dictionary.professionalDashboard.retentionRate}
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground dark:text-stone-100">
                92%
              </p>
              <p className="mt-1 flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="mr-0.5 h-3 w-3" />
                +2%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-sm dark:bg-stone-800/80">
          <h2 className="mb-4 text-lg font-semibold text-foreground dark:text-stone-100">
            {dictionary.professionalDashboard.recentMessages}
          </h2>
          {recentMessages.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-xl bg-muted text-center dark:bg-stone-700/30">
              <MessageSquare className="h-8 w-8 text-muted-foreground dark:text-stone-400" />
              <p className="mt-2 text-sm text-muted-foreground dark:text-stone-400">
                {dictionary.professionalMessages.empty}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentMessages.map((message) => {
                const partner =
                  message.senderId === session!.user.id
                    ? message.receiver
                    : message.sender;
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
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-sm dark:bg-stone-800/80">
          <h2 className="mb-4 text-lg font-semibold text-foreground dark:text-stone-100">
            {dictionary.professionalDashboard.pendingActions}
          </h2>
          <ul className="space-y-3">
            <li className="flex items-center justify-between rounded-xl bg-muted p-3 dark:bg-stone-700/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground dark:text-stone-100">
                    {dictionary.professionalDashboard.progressPhotoPending}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-stone-400">
                    Paciente: María G.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              >
                {dictionary.professionalDashboard.remind}
              </button>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-muted p-3 dark:bg-stone-700/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground dark:text-stone-100">
                    {dictionary.professionalDashboard.mealLogPending}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-stone-400">
                    Paciente: Carlos R.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              >
                {dictionary.professionalDashboard.review}
              </button>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-sm dark:bg-stone-800/80">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground dark:text-stone-100">
            {dictionary.professionalDashboard.subscriptionStatusTitle}
            </h2>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                hasActiveSubscription
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
              }`}
            >
              {hasActiveSubscription
                ? dictionary.professionalDashboard.active
                : dictionary.professionalDashboard.inactive}
            </span>
          </div>
          <p className="text-sm text-muted-foreground dark:text-stone-300">
            {dictionary.professionalDashboard.plan} {latestSubscription?.plan ?? "Free"} -{" "}
            {hasActiveSubscription
              ? dictionary.professionalDashboard.subscriptionStatus
                  .replace("{status}", "active")
                  .replace("{plan}", latestSubscription?.plan.toLowerCase() ?? "free")
              : dictionary.professionalDashboard.noSubscription}
          </p>
          <Link
            href="/profesional/dashboard/suscripcion"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <Crown className="h-4 w-4" />
            {dictionary.professionalDashboard.manage}
          </Link>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-sm dark:bg-stone-800/80">
          <h2 className="mb-4 text-lg font-semibold text-foreground dark:text-stone-100">
            {dictionary.professionalDashboard.weeklyAppointments}
          </h2>
          <div className="mb-3 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground dark:text-stone-400">
            {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
              <span key={i}>{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const dayDate = new Date(weekStart);
              dayDate.setDate(dayDate.getDate() + i);
              const dayAppointments = weeklyAppointments.filter((a) => {
                const d = new Date(a.scheduledAt);
                return (
                  d.getDate() === dayDate.getDate() &&
                  d.getMonth() === dayDate.getMonth() &&
                  d.getFullYear() === dayDate.getFullYear()
                );
              });
              const confirmed = dayAppointments.some((a) => a.status === "CONFIRMED");
              const pending = dayAppointments.some((a) => a.status === "REQUESTED");
              return (
                <div
                  key={i}
                  className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs font-semibold ${
                    confirmed
                      ? "bg-emerald-500 text-white"
                      : pending
                      ? "bg-amber-400 text-white"
                      : "bg-muted text-muted-foreground dark:bg-stone-700/30 dark:text-stone-400"
                  }`}
                >
                  {dayDate.getDate()}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground dark:text-stone-400">
                {dictionary.professionalDashboard.confirmed}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="text-muted-foreground dark:text-stone-400">
                {dictionary.professionalDashboard.pending}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricItem({
  label,
  value,
  trend,
  positive,
}: {
  label: string;
  value: string | number;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted p-4 dark:border-stone-700/50 dark:bg-stone-700/30">
      <div>
        <p className="text-sm text-muted-foreground dark:text-stone-400">{label}</p>
        <p className="text-2xl font-bold text-foreground dark:text-stone-100">{value}</p>
      </div>
      <span
        className={`flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
          positive
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
        }`}
      >
        {positive ? (
          <ArrowUpRight className="mr-0.5 h-3 w-3" />
        ) : (
          <ArrowDownRight className="mr-0.5 h-3 w-3" />
        )}
        {trend}
      </span>
    </div>
  );
}
