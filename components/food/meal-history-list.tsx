"use client";

import { Clock } from "lucide-react";
import type { MealEntryListItem } from "@/app/paciente/dashboard/nutricion/actions";
import type { Dictionary } from "@/lib/i18n/server";

interface MealHistoryListProps {
  dictionary: Dictionary;
  entries: MealEntryListItem[];
  onSelectEntry?: (entry: MealEntryListItem) => void;
}

export function MealHistoryList({ dictionary, entries, onSelectEntry }: MealHistoryListProps) {
  const mealTypeLabels: Record<MealEntryListItem["mealType"], string> = {
    BREAKFAST: dictionary.nutrition.mealTypeBreakfast,
    LUNCH: dictionary.nutrition.mealTypeLunch,
    DINNER: dictionary.nutrition.mealTypeDinner,
    SNACK: dictionary.nutrition.mealTypeSnack,
    OTHER: dictionary.nutrition.mealTypeOther,
  };

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl bg-[#2c2c2c] p-6">
        <h3 className="text-lg font-semibold text-white">
          {dictionary.nutrition.historyTitle}
        </h3>
        <p className="mt-2 text-white/60">
          {dictionary.nutrition.emptyHistory}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#2c2c2c] p-6">
      <h3 className="text-lg font-semibold text-white">
        {dictionary.nutrition.historyTitle}
      </h3>

      <ul className="mt-4 space-y-3">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => onSelectEntry?.(entry)}
              className="flex w-full items-center justify-between rounded-xl bg-[#212121] p-4 text-left transition-colors hover:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#55eb55] focus:ring-offset-2 focus:ring-offset-[#2c2c2c] cursor-pointer"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-white">
                  {entry.description}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-white/50">
                  <Clock className="h-3 w-3" />
                  {mealTypeLabels[entry.mealType]} ·{" "}
                  {new Date(entry.consumedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[#55eb55] px-3 py-1 text-sm font-semibold text-black">
                {entry.calories} kcal
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
