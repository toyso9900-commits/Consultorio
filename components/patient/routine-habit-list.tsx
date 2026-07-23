"use client";

import { useState, useTransition } from "react";
import {
  Bike,
  Check,
  Droplets,
  Dumbbell,
  Footprints,
  Heart,
  Minus,
  Moon,
  Plus,
  Salad,
  Utensils,
} from "lucide-react";
import { toast } from "sonner";
import {
  adjustWaterItem,
  toggleCheckItem,
} from "@/app/paciente/dashboard/rutina/actions";
import type { RoutineItemIcon } from "@/lib/routine-items";

// Mirror of WATER_STEP_ML in lib/routine-items.ts to keep zod/prisma out of
// the browser bundle.
const WATER_STEP_ML = 250;

export type PlanItemType = "CHECK" | "WATER" | "AUTO_MEALS";

export type WeekDayState = "complete" | "partial" | "empty" | "future";

export interface WeekDayView {
  date: string;
  state: WeekDayState;
  isToday: boolean;
}

export interface PlanItemView {
  id: string;
  type: PlanItemType;
  title: string;
  icon: string;
  goal: number | null;
  count: number;
  satisfied: boolean;
  readOnly: boolean;
}

type RoutineHabitListLabels = {
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
};

const ICON_COMPONENTS = {
  footprints: Footprints,
  droplets: Droplets,
  utensils: Utensils,
  dumbbell: Dumbbell,
  heart: Heart,
  moon: Moon,
  bike: Bike,
  salad: Salad,
} satisfies Record<RoutineItemIcon, typeof Footprints>;

function itemIcon(icon: string) {
  return icon in ICON_COMPONENTS
    ? ICON_COMPONENTS[icon as RoutineItemIcon]
    : Dumbbell;
}

function fill(template: string, values: Record<string, number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template
  );
}

function DayRing({
  state,
  isToday,
  label,
}: {
  state: WeekDayState;
  isToday: boolean;
  label: string;
}) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress =
    state === "complete" ? 100 : state === "partial" ? 50 : 0;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const ringColor =
    state === "complete"
      ? "text-emerald-500"
      : state === "partial"
        ? "text-emerald-500/60"
        : "text-white/10";

  return (
    <div
      className="flex flex-col items-center gap-1.5"
      aria-label={label}
      title={label}
    >
      <div className="relative flex h-11 w-11 items-center justify-center">
        <svg
          className="h-full w-full -rotate-90 transform"
          viewBox="0 0 44 44"
          aria-hidden="true"
        >
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="3"
            className={ringColor}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {state === "complete" ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : state === "partial" ? (
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          ) : null}
        </div>
      </div>
      {isToday && (
        <span className="h-1 w-1 rounded-full bg-emerald-500" aria-hidden="true" />
      )}
    </div>
  );
}

type RoutineHabitListProps = {
  items: PlanItemView[];
  week: WeekDayView[];
  labels: RoutineHabitListLabels;
};

export function RoutineHabitList({
  items: initialItems,
  week,
  labels,
}: RoutineHabitListProps) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  const handleToggleCheck = (item: PlanItemView) => {
    startTransition(async () => {
      const result = await toggleCheckItem(item.id);
      if (result.success) {
        setItems((prev) =>
          prev.map((current) =>
            current.id === item.id
              ? {
                  ...current,
                  count: result.count,
                  satisfied: result.count >= 1,
                }
              : current
          )
        );
      } else {
        toast.error(labels.trackError);
      }
    });
  };

  const handleAdjustWater = (item: PlanItemView, delta: number) => {
    startTransition(async () => {
      const result = await adjustWaterItem(item.id, delta);
      if (result.success) {
        setItems((prev) =>
          prev.map((current) =>
            current.id === item.id
              ? {
                  ...current,
                  count: result.count,
                  satisfied: current.goal != null && result.count >= current.goal,
                }
              : current
          )
        );
      } else {
        toast.error(labels.trackError);
      }
    });
  };

  const dayInitials = labels.weekDaysShort.split(",").map((day) => day.trim());

  const dayStateLabel = (state: WeekDayState): string => {
    switch (state) {
      case "complete":
        return labels.dayStateComplete;
      case "partial":
        return labels.dayStatePartial;
      case "empty":
        return labels.dayStateEmpty;
      case "future":
        return labels.dayStateFuture;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">
          {labels.dailyHabits}
        </h3>

        {items.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">{labels.noItemsYet}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((item) => {
              const Icon = itemIcon(item.icon);

              if (item.type === "WATER") {
                const progress =
                  item.goal && item.goal > 0
                    ? Math.min((item.count / item.goal) * 100, 100)
                    : 0;

                return (
                  <li
                    key={item.id}
                    className="rounded-xl border border-[#36322e] bg-[#2a2622] p-3 transition-colors hover:border-[#44403c]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {item.title}
                        </p>
                        <p className="text-xs text-white/50">
                          {fill(labels.waterProgress, {
                            count: item.count,
                            goal: item.goal ?? 0,
                          })}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          aria-label={labels.waterRemove}
                          onClick={() => handleAdjustWater(item, -WATER_STEP_ML)}
                          disabled={isPending || item.count <= 0}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#52504d] text-white/70 transition-colors hover:border-emerald-500/50 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={labels.waterAdd}
                          onClick={() => handleAdjustWater(item, WATER_STEP_ML)}
                          disabled={
                            isPending ||
                            (item.goal != null && item.count >= item.goal)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </li>
                );
              }

              if (item.type === "AUTO_MEALS") {
                return (
                  <li
                    key={item.id}
                    className="rounded-xl border border-[#36322e] bg-[#2a2622] p-3 transition-colors hover:border-[#44403c]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {item.title}
                        </p>
                        {item.goal != null && (
                          <p className="text-xs text-white/50">
                            {fill(labels.mealsProgress, {
                              count: item.count,
                              goal: item.goal,
                            })}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-full bg-[#3f3b36] px-3 py-1 text-xs font-medium text-white/80">
                        {labels.autoBadge}
                      </span>
                    </div>
                  </li>
                );
              }

              return (
                <li
                  key={item.id}
                  className={`rounded-xl border p-3 transition-colors ${
                    item.satisfied
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-[#36322e] bg-[#2a2622] hover:border-[#44403c]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/70">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`flex-1 text-sm font-medium ${
                        item.satisfied ? "text-emerald-100" : "text-white"
                      }`}
                    >
                      {item.title}
                    </span>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={item.satisfied}
                      aria-label={item.title}
                      onClick={() => handleToggleCheck(item)}
                      disabled={isPending}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        item.satisfied
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-[#52504d] text-transparent hover:border-emerald-500/50"
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {items.length > 0 && week.length === 7 && (
        <div
          className="rounded-xl border border-[#36322e] bg-[#2a2622] p-4"
          role="group"
          aria-label={labels.weekStripLabel}
        >
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
            {labels.weeklyView}
          </h3>
          <ol className="grid grid-cols-7 gap-2">
            {week.map((day, index) => (
              <li key={day.date} className="flex flex-col items-center gap-1">
                <span className="text-xs text-white/40">
                  {dayInitials[index] ?? ""}
                </span>
                <DayRing
                  state={day.state}
                  isToday={day.isToday}
                  label={`${dayInitials[index] ?? day.date}: ${dayStateLabel(
                    day.state
                  )}`}
                />
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
