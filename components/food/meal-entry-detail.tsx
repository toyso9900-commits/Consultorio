"use client";

import Image from "next/image";
import {
  ArrowLeft,
  Beef,
  Clock,
  Droplets,
  UtensilsCrossed,
  Wheat,
} from "lucide-react";
import type { MealEntryListItem } from "@/app/paciente/dashboard/nutricion/actions";
import { CalorieDonutChart } from "./calorie-donut-chart";
import type { Dictionary } from "@/lib/i18n/server";

interface MealEntryDetailProps {
  entry: MealEntryListItem;
  dictionary: Dictionary;
  onClose: () => void;
}

const MACRO_COLORS = {
  protein: "#55eb55",
  carbs: "#5555eb",
  fat: "#ebeb55",
};

const MACRO_ICONS = {
  protein: Beef,
  carbs: Wheat,
  fat: Droplets,
};

export function MealEntryDetail({
  entry,
  dictionary,
  onClose,
}: MealEntryDetailProps) {
  const mealTypeLabels: Record<MealEntryListItem["mealType"], string> = {
    BREAKFAST: dictionary.nutrition.mealTypeBreakfast,
    LUNCH: dictionary.nutrition.mealTypeLunch,
    DINNER: dictionary.nutrition.mealTypeDinner,
    SNACK: dictionary.nutrition.mealTypeSnack,
    OTHER: dictionary.nutrition.mealTypeOther,
  };

  const totals = {
    calories: entry.calories,
    proteinG: entry.proteinG ?? 0,
    carbsG: entry.carbsG ?? 0,
    fatG: entry.fatG ?? 0,
  };

  return (
    <div className="rounded-2xl bg-[#2c2c2c] p-6">
      <button
        type="button"
        onClick={onClose}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-[#55eb55]"
      >
        <ArrowLeft className="h-4 w-4" />
        {dictionary.nutrition.back}
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          {entry.imageUrl ? (
            <div className="relative h-64 overflow-hidden rounded-xl bg-[#212121]">
              <Image
                src={entry.imageUrl}
                alt={entry.description}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="rounded-xl bg-[#212121] p-4">
            <p className="text-sm font-medium text-white/80">
              {dictionary.nutrition.description}
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {entry.description}
            </p>
          </div>

          <div className="rounded-xl bg-[#212121] p-4">
            <p className="text-sm font-medium text-white/80">
              {dictionary.nutrition.mealType}
            </p>
            <p className="mt-1 flex items-center gap-2 text-base font-medium text-white">
              <UtensilsCrossed className="h-4 w-4 text-[#55eb55]" />
              {mealTypeLabels[entry.mealType]}
            </p>
            <p className="mt-2 flex items-center gap-1 text-xs text-white/50">
              <Clock className="h-3 w-3" />
              {new Date(entry.consumedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl bg-[#212121] p-4">
            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
              <CalorieDonutChart
                calories={totals.calories}
                proteinG={totals.proteinG}
                carbsG={totals.carbsG}
                fatG={totals.fatG}
                totalLabel={dictionary.nutrition.totalEstimated}
              />
              <MacroLegend totals={totals} dictionary={dictionary} />
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-white/80">
              {dictionary.nutrition.ingredients}
            </h4>
            <ul className="space-y-2">
              {entry.ingredients.map((ingredient, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between rounded-xl bg-[#212121] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2c2c2c] text-[#55eb55]">
                      <UtensilsCrossed className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {ingredient.name}
                      </p>
                      <p className="mt-0.5 flex flex-wrap gap-2 text-xs text-white/50">
                        <span>P {formatMacro(ingredient.proteinG)}</span>
                        <span>C {formatMacro(ingredient.carbsG)}</span>
                        <span>F {formatMacro(ingredient.fatG)}</span>
                        <span className="text-[#55eb55]">
                          {ingredient.calories} kcal
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-white/70">
                    {formatWeight(ingredient.weightG)}g
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MacroLegendProps {
  totals: {
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  dictionary: Dictionary;
}

function MacroLegend({ totals, dictionary }: MacroLegendProps) {
  const totalG = totals.proteinG + totals.carbsG + totals.fatG;

  const items = [
    {
      key: "protein" as const,
      label: dictionary.nutrition.protein,
      value: totals.proteinG,
      color: MACRO_COLORS.protein,
      icon: MACRO_ICONS.protein,
    },
    {
      key: "carbs" as const,
      label: dictionary.nutrition.carbs,
      value: totals.carbsG,
      color: MACRO_COLORS.carbs,
      icon: MACRO_ICONS.carbs,
    },
    {
      key: "fat" as const,
      label: dictionary.nutrition.fat,
      value: totals.fatG,
      color: MACRO_COLORS.fat,
      icon: MACRO_ICONS.fat,
    },
  ];

  return (
    <div className="w-full min-w-[10rem] space-y-3">
      {items.map((item) => {
        const percentage = totalG > 0 ? (item.value / totalG) * 100 : 0;
        return (
          <div key={item.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4" style={{ color: item.color }} />
                <span className="font-medium text-white/80">{item.label}</span>
              </div>
              <span className="font-semibold text-white">
                {formatMacro(item.value)}g
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#3c3c3c]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${percentage}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatMacro(value: number | null | undefined): string {
  if (value == null) return "0";
  return value.toFixed(1);
}

function formatWeight(value: number | null | undefined): string {
  if (value == null) return "0";
  return value.toFixed(0);
}
