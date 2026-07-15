"use client";

import { useState } from "react";
import { Check, Droplets, Footprints, Leaf, Utensils } from "lucide-react";
import { toast } from "sonner";

type RoutinePlanCardLabels = {
  markCompleted: string;
  completed: string;
  completedToast: string;
  planGeneralTitle: string;
  planWalk: string;
  planWater: string;
  planMeals: string;
};

type RoutinePlanCardProps = {
  title: string;
  secondaryLine: string;
  content: string;
  labels: RoutinePlanCardLabels;
};

type PlanItemKey = "walk" | "water" | "meals";

const planItems: ReadonlyArray<{ key: PlanItemKey; icon: typeof Footprints }> =
  [
    { key: "walk", icon: Footprints },
    { key: "water", icon: Droplets },
    { key: "meals", icon: Utensils },
  ];

export function RoutinePlanCard({
  title,
  secondaryLine,
  content,
  labels,
}: RoutinePlanCardProps) {
  // Presentational only: completion state lives in local React state and is
  // never persisted (no backend for this yet).
  const [completed, setCompleted] = useState(false);
  const [checkedItems, setCheckedItems] = useState<
    Record<PlanItemKey, boolean>
  >({ walk: false, water: false, meals: false });

  const planLabels: Record<PlanItemKey, string> = {
    walk: labels.planWalk,
    water: labels.planWater,
    meals: labels.planMeals,
  };

  const toggleCompleted = () => {
    setCompleted((prev) => {
      const next = !prev;
      if (next) {
        toast.success(labels.completedToast);
      }
      return next;
    });
  };

  const toggleItem = (key: PlanItemKey) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
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
          <ul className="mt-4 space-y-3">
            {planItems.map(({ key, icon: Icon }) => {
              const checked = checkedItems[key];
              return (
                <li key={key} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                    <Icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className="flex-1 text-sm text-foreground">
                    {planLabels[key]}
                  </span>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    aria-label={planLabels[key]}
                    onClick={() => toggleItem(key)}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      checked
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
        </div>
      </div>
    </div>
  );
}
