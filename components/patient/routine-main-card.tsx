"use client";

import { Dumbbell, Flame } from "lucide-react";
import { RoutineHabitList, PlanItemView, WeekDayView } from "./routine-habit-list";
import { RoutineFreeSection } from "./routine-free-section";

type RoutineMainCardLabels = {
  byProfessional: string;
  publishedAt: string;
  updatedAt: string;
  streakDays: string;
  switchToFree: string;
  noItemsYet: string;
  waterProgress: string;
  waterAdd: string;
  waterRemove: string;
  mealsProgress: string;
  autoBadge: string;
  trackError: string;
  weekStripLabel: string;
  weekDaysShort: string;
  dayStateComplete: string;
  dayStatePartial: string;
  dayStateEmpty: string;
  dayStateFuture: string;
  dailyHabits: string;
  weeklyView: string;
  freePlanTitle: string;
  freePlanBody: string;
  freePlanIncluded: string;
  freeChecklistWalk: string;
  freeChecklistHydration: string;
  freeChecklistMeals: string;
};

type RoutineMainCardProps = {
  title: string;
  professionalName: string;
  content: string;
  publishedAt: Date;
  updatedAt: Date;
  locale: string;
  streak: number;
  items: PlanItemView[];
  week: WeekDayView[];
  labels: RoutineMainCardLabels;
};

export function RoutineMainCard({
  title,
  professionalName,
  content,
  publishedAt,
  updatedAt,
  locale,
  streak,
  items,
  week,
  labels,
}: RoutineMainCardProps) {
  const publishedDate = publishedAt.toLocaleDateString(locale);
  const updatedDate = updatedAt.toLocaleDateString(locale);

  const checklist = [
    labels.freeChecklistWalk,
    labels.freeChecklistHydration,
    labels.freeChecklistMeals,
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#2f2c28] bg-[#23201d]/95 p-6 shadow-xl backdrop-blur-sm sm:p-8">
      {/* Subtle decorative gradient in the corner. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl"
      />

      <div className="relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
              <Dumbbell className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {title}
                </h2>
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                  {labels.byProfessional.replace("{name}", professionalName)}
                </span>
              </div>
              <p className="mt-1 text-sm text-white/50">
                {labels.publishedAt.replace("{date}", publishedDate)} ·{" "}
                {labels.updatedAt.replace("{date}", updatedDate)}
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-[#2c2824] px-4 py-2 text-sm font-semibold text-orange-400">
              <Flame aria-hidden="true" className="h-4 w-4" />
              {labels.streakDays.replace("{count}", String(streak))}
            </span>
          )}
        </div>

        <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-white/70">
          {content}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <RoutineHabitList items={items} week={week} labels={labels} />

            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("free-plan-section")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="w-full rounded-xl border border-[#44403c] bg-[#2a2622] py-3 text-sm font-semibold text-white/80 transition-colors hover:border-emerald-500/50 hover:bg-[#2f2b27] hover:text-white"
            >
              {labels.switchToFree}
            </button>
          </div>

          <RoutineFreeSection
            id="free-plan-section"
            title={labels.freePlanTitle}
            description={labels.freePlanBody}
            checklist={checklist}
            includedLabel={labels.freePlanIncluded}
          />
        </div>
      </div>
    </div>
  );
}
