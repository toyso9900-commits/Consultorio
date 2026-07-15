"use client";

import { useState, useTransition } from "react";
import {
  Bike,
  Check,
  Droplets,
  Dumbbell,
  Footprints,
  Heart,
  Leaf,
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

// Mirror of WATER_STEP_ML in lib/routine-items.ts — a runtime import would
// pull zod/@prisma/client into the browser bundle.
const WATER_STEP_ML = 250;

export type PlanItemType = "CHECK" | "WATER" | "AUTO_MEALS";

/**
 * Server-assembled view model for one plan item (lib/daily-plan.ts).
 * Structurally identical to DailyPlanItem — kept as a local type so the
 * client bundle never imports the server read model.
 */
export interface PlanItemView {
  id: string;
  type: PlanItemType;
  title: string;
  icon: string;
  /** ml for WATER, meal count for AUTO_MEALS; always null for CHECK. */
  goal: number | null;
  /** CHECK: 0/1 · WATER: ml today · AUTO_MEALS: 0 until S2 derives it. */
  count: number;
  satisfied: boolean;
  readOnly: boolean;
}

type RoutinePlanCardLabels = {
  markCompleted: string;
  completed: string;
  completedToast: string;
  planGeneralTitle: string;
  noItemsYet: string;
  waterProgress: string;
  waterAdd: string;
  waterRemove: string;
  mealsGoal: string;
  autoBadge: string;
  trackError: string;
};

type RoutinePlanCardProps = {
  title: string;
  secondaryLine: string;
  content: string;
  items: PlanItemView[];
  labels: RoutinePlanCardLabels;
};

// Type-only import above keeps zod out of the client bundle; this map
// mirrors the server icon allowlist and `satisfies` turns any drift
// (missing/extra key) into a compile-time error.
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

export function RoutinePlanCard({
  title,
  secondaryLine,
  content,
  items: initialItems,
  labels,
}: RoutinePlanCardProps) {
  // Presentational only: the whole-routine pill is legacy local state and
  // is never persisted — real completion is tracked per item below.
  const [completed, setCompleted] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  const toggleCompleted = () => {
    setCompleted((prev) => {
      const next = !prev;
      if (next) {
        toast.success(labels.completedToast);
      }
      return next;
    });
  };

  // Server state is the source of truth: the card adopts the count the
  // action returns instead of guessing, so rapid taps can never desync.
  const handleToggleCheck = (item: PlanItemView) => {
    startTransition(async () => {
      const result = await toggleCheckItem(item.id);
      if (result.success) {
        setItems((prev) =>
          prev.map((current) =>
            current.id === item.id
              ? { ...current, count: result.count, satisfied: result.count >= 1 }
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

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      {/* Decorative corner leaves — purely ornamental. */}
      <Leaf
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rotate-12 select-none text-emerald-600/10"
      />
      <Leaf
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-5 -left-5 h-20 w-20 -rotate-45 select-none text-emerald-600/10"
      />

      <div className="relative">
        <h2 className="text-xl font-bold text-card-foreground sm:text-2xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{secondaryLine}</p>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground">
          {content}
        </p>

        <button
          type="button"
          onClick={toggleCompleted}
          aria-pressed={completed}
          className={`mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition-colors ${
            completed
              ? "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
              : "bg-emerald-600 text-white hover:bg-emerald-700 dark:hover:bg-emerald-500"
          }`}
        >
          {completed && <Check className="h-4 w-4 text-emerald-600" />}
          {completed ? labels.completed : labels.markCompleted}
        </button>

        <div className="mt-8 border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-card-foreground">
            {labels.planGeneralTitle}
          </h3>
          {items.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {labels.noItemsYet}
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {items.map((item) => {
                const Icon = itemIcon(item.icon);

                if (item.type === "WATER") {
                  return (
                    <li key={item.id} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                        <Icon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
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
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition-colors hover:border-emerald-500 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-600 dark:text-stone-300"
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
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-emerald-500"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                }

                // AUTO_MEALS: read-only row. The MealEntry derivation lands
                // in S2 — for now the count is intentionally not wired and
                // the row shows only the goal plus a neutral "auto" badge.
                if (item.type === "AUTO_MEALS") {
                  return (
                    <li key={item.id} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                        <Icon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{item.title}</p>
                        {item.goal != null && (
                          <p className="text-xs text-muted-foreground">
                            {fill(labels.mealsGoal, { goal: item.goal })}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                        {labels.autoBadge}
                      </span>
                    </li>
                  );
                }

                return (
                  <li key={item.id} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                      <Icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="flex-1 text-sm text-foreground">
                      {item.title}
                    </span>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={item.satisfied}
                      aria-label={item.title}
                      onClick={() => handleToggleCheck(item)}
                      disabled={isPending}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        item.satisfied
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-stone-300 text-transparent hover:border-emerald-500 dark:border-stone-600"
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
