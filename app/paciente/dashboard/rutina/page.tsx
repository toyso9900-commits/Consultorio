import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listActiveSubscriptionsForPatient } from "@/lib/patient-subscriptions";
import { getDailyPlanForPatient } from "@/lib/daily-plan";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { TimezoneAutoDetect } from "@/components/patient/timezone-auto-detect";
import { ProfessionalSelector } from "@/components/patient/professional-selector";
import { RoutineMainCard } from "@/components/patient/routine-main-card";
import { RoutineProfessionalSummaryCard } from "@/components/patient/routine-professional-summary-card";

export default async function PatientRoutinePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "PATIENT") {
    redirect("/login");
  }

  const patientId = session.user.id;
  const locale = await getLocale(patientId);
  const dictionary = await getDictionary(locale);
  const t = dictionary.patientRoutine;
  const query = await searchParams;

  const activeSubscriptions = await listActiveSubscriptionsForPatient(patientId);
  const isSubscribed = activeSubscriptions.length > 0;

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

  const user = await prisma.user.findUnique({
    where: { id: patientId },
    select: { timezone: true },
  });

  const dailyPlans = await getDailyPlanForPatient(
    patientId,
    routines.map((routine) => routine.id),
    user?.timezone ?? null
  );
  const plansByRoutineId = new Map(
    dailyPlans.map((plan) => [plan.routineId, plan])
  );
  const routinesByProfessionalId = new Map(
    routines.map((routine) => [routine.professionalId, routine])
  );

  const professionalSummaries = activeSubscriptions.map((sub) => ({
    id: sub.professionalId,
    name: sub.professional.name ?? "",
    specialty: sub.professional.professionalProfile?.specialty ?? null,
    title: sub.professional.professionalProfile?.title ?? null,
    image: sub.professional.image ?? null,
  }));

  const requestedProfessionalId =
    typeof query.professional === "string" ? query.professional : undefined;

  const selectedProfessionalId =
    requestedProfessionalId &&
    professionalSummaries.some((p) => p.id === requestedProfessionalId)
      ? requestedProfessionalId
      : professionalSummaries[0]?.id;

  const selectedRoutine = selectedProfessionalId
    ? routinesByProfessionalId.get(selectedProfessionalId)
    : undefined;

  const selectedPlan = selectedRoutine
    ? plansByRoutineId.get(selectedRoutine.id)
    : undefined;

  const otherProfessionals = selectedProfessionalId
    ? professionalSummaries.filter((p) => p.id !== selectedProfessionalId)
    : [];

  function specialtyLabel(specialty: string | null): string {
    switch (specialty) {
      case "NUTRITION":
        return t.professionalTypeNutrition;
      case "TRAINING":
        return t.professionalTypeTraining;
      case "BOTH":
        return t.professionalTypeBoth;
      default:
        return "";
    }
  }

  function routineStatusForProfessional(professionalId: string): string {
    const routine = routinesByProfessionalId.get(professionalId);
    if (!routine) {
      return t.routineStatusNone;
    }
    const specialty = specialtyLabel(
      professionalSummaries.find((p) => p.id === professionalId)?.specialty ?? null
    );
    return t.routineStatusActive.replace("{specialty}", specialty || "Activa");
  }

  return (
    <div
      className="relative -m-4 min-h-full space-y-8 bg-[#1c1917] p-4 sm:-m-6 sm:p-6"
      data-role="patient"
    >
      <TimezoneAutoDetect />

      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{t.title}</h1>
          <p className="text-sm text-white/50">{t.subtitle}</p>
        </div>
      </div>

      {!isSubscribed ? (
        <div className="rounded-2xl border border-[#2f2c28] bg-[#23201d] p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15">
            <Lock className="h-6 w-6 text-amber-400" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-white">
            {t.paywallTitle}
          </h2>
          <p className="mt-2 text-sm text-white/60">{t.paywallBody}</p>
          <Link
            href="/paciente/dashboard/expertos"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
          >
            {t.paywallCta}
          </Link>
        </div>
      ) : activeSubscriptions.length === 0 ? (
        <div className="rounded-2xl border border-[#2f2c28] bg-[#23201d] p-6 text-center shadow-sm sm:p-8">
          <p className="text-white/60">{t.paywallBody}</p>
        </div>
      ) : (
        <>
          {professionalSummaries.length > 0 && selectedProfessionalId && (
            <ProfessionalSelector
              professionals={professionalSummaries}
              selectedId={selectedProfessionalId}
              labels={{
                activeProfessional: t.activeProfessional,
              }}
            />
          )}

          {selectedRoutine ? (
            <RoutineMainCard
              title={selectedRoutine.title}
              professionalName={selectedRoutine.professional.name ?? ""}
              content={selectedRoutine.content}
              publishedAt={selectedRoutine.createdAt}
              updatedAt={selectedRoutine.updatedAt}
              locale={locale}
              streak={selectedPlan?.streak ?? 0}
              items={selectedPlan?.items ?? []}
              week={selectedPlan?.week ?? []}
              labels={{
                byProfessional: t.byProfessional,
                publishedAt: t.publishedAt,
                updatedAt: t.updatedAt,
                streakDays: t.streakDays,
                switchToFree: t.switchToFree,
                noItemsYet: t.noItemsYet,
                waterProgress: t.waterProgress,
                waterAdd: t.waterAdd,
                waterRemove: t.waterRemove,
                mealsProgress: t.mealsProgress,
                autoBadge: t.autoBadge,
                trackError: t.trackError,
                weekStripLabel: t.weekStripLabel,
                weekDaysShort: t.weekDaysShort,
                dayStateComplete: t.dayStateComplete,
                dayStatePartial: t.dayStatePartial,
                dayStateEmpty: t.dayStateEmpty,
                dayStateFuture: t.dayStateFuture,
                dailyHabits: t.dailyHabits,
                weeklyView: t.weeklyView,
                freePlanTitle: t.freePlanTitle,
                freePlanBody: t.freePlanBody,
                freePlanIncluded: t.freePlanIncluded,
                freeChecklistWalk: t.freeChecklistWalk,
                freeChecklistHydration: t.freeChecklistHydration,
                freeChecklistMeals: t.freeChecklistMeals,
              }}
            />
          ) : (
            <div className="rounded-2xl border border-[#2f2c28] bg-[#23201d] p-6 text-center shadow-sm sm:p-8">
              <p className="text-white/60">{t.noRoutineForProfessional}</p>
            </div>
          )}

          {otherProfessionals.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                {t.otherProfessionals}
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {otherProfessionals.map((professional) => (
                  <RoutineProfessionalSummaryCard
                    key={professional.id}
                    professional={professional}
                    routineStatus={routineStatusForProfessional(professional.id)}
                    viewDetailLabel={t.viewDetail}
                    href={`/paciente/dashboard/rutina?professional=${encodeURIComponent(
                      professional.id
                    )}`}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
