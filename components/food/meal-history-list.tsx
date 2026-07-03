"use client";

import { Clock } from "lucide-react";
import type { MealEntryListItem } from "@/app/paciente/dashboard/nutricion/actions";
import type { Dictionary } from "@/lib/i18n/server";

interface MealHistoryListProps {
  dictionary: Dictionary;
  entries: MealEntryListItem[];
}

export function MealHistoryList({ dictionary, entries }: MealHistoryListProps) {
  const mealTypeLabels: Record<MealEntryListItem["mealType"], string> = {
    BREAKFAST: dictionary.nutrition.mealTypeBreakfast,
    LUNCH: dictionary.nutrition.mealTypeLunch,
    DINNER: dictionary.nutrition.mealTypeDinner,
    SNACK: dictionary.nutrition.mealTypeSnack,
    OTHER: dictionary.nutrition.mealTypeOther,
  };

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {dictionary.nutrition.historyTitle}
        </h3>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {dictionary.nutrition.emptyHistory}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {dictionary.nutrition.historyTitle}
      </h3>

      <ul className="mt-4 space-y-3">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                {entry.description}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="h-3 w-3" />
                {mealTypeLabels[entry.mealType]} ·{" "}
                {entry.consumedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              {entry.calories} kcal
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
