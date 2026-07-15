import Link from "next/link";
import { redirect } from "next/navigation";
import { Dumbbell, Leaf, Lock } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listActiveSubscriptionsForPatient } from "@/lib/patient-subscriptions";
import { getDailyPlanForPatient } from "@/lib/daily-plan";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { RoutinePlanCard } from "@/components/patient/routine-plan-card";
import { TimezoneAutoDetect } from "@/components/patient/timezone-auto-detect";

export default async function PatientRoutinePage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "PATIENT") {
    redirect("/login");
  }

  const patientId = session.user.id;
  const locale = await getLocale(patientId);
  const dictionary = await getDictionary(locale);
  const t = dictionary.patientRoutine;

  // Lazy expiry: ACTIVE or CANCELLED-but-not-expired subscriptions still
  // grant access until expiresAt passes (see lib/patient-subscriptions).
  const activeSubscriptions = await listActiveSubscriptionsForPatient(patientId);
  const isSubscribed = activeSubscriptions.length > 0;

  // Only fetch personalized content when at least one subscription is
  // active — non-subscribers must never receive routine content (REQ-004).
  const routines = isSubscribed
    ? await prisma.routine.findMany({
        where: {
          patientId,
          professionalId: {
            in: activeSubscriptions.map((sub) => sub.professionalId),
          },
        },
        include: { professional: { select: { id: true, name: true } } },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  // Daily plan read model (DPT-001): one independent tracker per routine.
  // Day boundaries use the patient's IANA timezone, falling back to
  // server-local when it has not been detected yet (DPT-004).
  const user = await prisma.user.findUnique({
    where: { id: patientId },
    select: { timezone: true },
  });

  const dailyPlans = await getDailyPlanForPatient(
    patientId,
    routines.map((routine) => routine.id),
    user?.timezone ?? null
  );
  const itemsByRoutineId = new Map(
    dailyPlans.map((plan) => [plan.routineId, plan.items])
  );

  return (
    <div className="space-y-6" data-role="patient">
      {/* Persist-once timezone detection (DPT-004); renders nothing. */}
      <TimezoneAutoDetect />
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
          <Dumbbell className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">{t.title}</h1>
        </div>
      </div>

      {!isSubscribed ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
            <Lock className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-card-foreground">
            {t.paywallTitle}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.paywallBody}</p>
          <Link
            href="/paciente/dashboard/expertos"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 dark:hover:bg-emerald-500"
          >
            {t.paywallCta}
          </Link>
        </div>
      ) : routines.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
          <p className="text-muted-foreground">{t.noRoutineYet}</p>
        </div>
      ) : (
        <ul className="space-y-6">
          {routines.map((routine) => (
            <li key={routine.id}>
              <RoutinePlanCard
                title={routine.title}
                secondaryLine={`${t.publishedBy.replace(
                  "{name}",
                  routine.professional.name ?? ""
                )} · ${t.updatedAt.replace(
                  "{date}",
                  routine.updatedAt.toLocaleDateString(locale)
                )}`}
                content={routine.content}
                items={itemsByRoutineId.get(routine.id) ?? []}
                labels={{
                  markCompleted: t.markCompleted,
                  completed: t.completed,
                  completedToast: t.completedToast,
                  planGeneralTitle: t.planGeneralTitle,
                  noItemsYet: t.noItemsYet,
                  waterProgress: t.waterProgress,
                  waterAdd: t.waterAdd,
                  waterRemove: t.waterRemove,
                  mealsGoal: t.mealsGoal,
                  autoBadge: t.autoBadge,
                  trackError: t.trackError,
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {/* FREE plan: static default content, identical for every patient and
          never editable by professionals (REQ-005). */}
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
            <Leaf className="h-5 w-5 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold text-card-foreground">
            {t.freePlanTitle}
          </h2>
        </div>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {t.freePlanBody}
        </p>
      </div>
    </div>
  );
}
