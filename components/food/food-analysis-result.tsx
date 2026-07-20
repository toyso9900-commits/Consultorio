"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  AlertTriangle,
  Beef,
  Droplets,
  Moon,
  MoreHorizontal,
  Search,
  Sun,
  Sunset,
  Trash2,
  UtensilsCrossed,
  Wheat,
} from "lucide-react";
import { saveMealEntry, type FoodAnalysisData } from "@/app/paciente/dashboard/nutricion/actions";
import {
  calculateIngredientCalories,
  calculateIngredientMacro,
  findNutrientByNameFuzzy,
} from "@/lib/nutrition-data";
import { CalorieDonutChart } from "./calorie-donut-chart";
import type { Dictionary } from "@/lib/i18n/server";

interface FoodAnalysisResultProps {
  dictionary: Dictionary;
  initialData: FoodAnalysisData;
  imageUrl: string;
  needsReferenceWarning: boolean;
}

export function FoodAnalysisResult({
  dictionary,
  initialData,
  imageUrl,
  needsReferenceWarning,
}: FoodAnalysisResultProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAdjusting, startAdjusting] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [referenceDismissed, setReferenceDismissed] = useState(false);
  const [form, setForm] = useState({
    description: initialData.description,
    mealType: "OTHER" as const,
  });
  const [ingredients, setIngredients] = useState(initialData.ingredients);

  const totals = ingredients.reduce(
    (acc, ingredient) => ({
      calories: acc.calories + ingredient.calories,
      proteinG: acc.proteinG + (ingredient.proteinG ?? 0),
      carbsG: acc.carbsG + (ingredient.carbsG ?? 0),
      fatG: acc.fatG + (ingredient.fatG ?? 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  function recalculateFromWeight(
    ingredient: FoodAnalysisData["ingredients"][number],
    previousWeightG: number
  ): FoodAnalysisData["ingredients"][number] {
    if (ingredient.weightG <= 0) {
      return { ...ingredient, calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };
    }

    const row = findNutrientByNameFuzzy(ingredient.name);
    if (row) {
      return {
        ...ingredient,
        calories: calculateIngredientCalories(ingredient.weightG, row.kcalPer100g),
        proteinG: calculateIngredientMacro(ingredient.weightG, row.proteinGPer100g),
        carbsG: calculateIngredientMacro(ingredient.weightG, row.carbsGPer100g),
        fatG: calculateIngredientMacro(ingredient.weightG, row.fatGPer100g),
      };
    }

    if (previousWeightG <= 0) return ingredient;

    const ratio = ingredient.weightG / previousWeightG;
    return {
      ...ingredient,
      calories: Math.round(ingredient.calories * ratio),
      proteinG: ingredient.proteinG != null ? round(ingredient.proteinG * ratio) : undefined,
      carbsG: ingredient.carbsG != null ? round(ingredient.carbsG * ratio) : undefined,
      fatG: ingredient.fatG != null ? round(ingredient.fatG * ratio) : undefined,
    };
  }

  function recalculateFromName(
    ingredient: FoodAnalysisData["ingredients"][number]
  ): FoodAnalysisData["ingredients"][number] {
    const row = findNutrientByNameFuzzy(ingredient.name);
    if (!row) return ingredient;

    return {
      ...ingredient,
      calories: calculateIngredientCalories(ingredient.weightG, row.kcalPer100g),
      proteinG: calculateIngredientMacro(ingredient.weightG, row.proteinGPer100g),
      carbsG: calculateIngredientMacro(ingredient.weightG, row.carbsGPer100g),
      fatG: calculateIngredientMacro(ingredient.weightG, row.fatGPer100g),
    };
  }

  function updateIngredientName(index: number, name: string) {
    setIngredients((prev) =>
      prev.map((ingredient, i) =>
        i === index ? recalculateFromName({ ...ingredient, name }) : ingredient
      )
    );
  }

  function updateIngredientWeight(index: number, weightG: number) {
    setIngredients((prev) => {
      const previousWeightG = prev[index]?.weightG ?? 0;
      return prev.map((ingredient, i) =>
        i === index
          ? recalculateFromWeight({ ...ingredient, weightG }, previousWeightG)
          : ingredient
      );
    });
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  function adjustAndConfirm() {
    setError(null);
    startAdjusting(() => {
      setIngredients((prev) => prev.map((ingredient) => recalculateFromName(ingredient)));
    });
  }

  function handleSave() {
    setError(null);

    startTransition(async () => {
      const result = await saveMealEntry({
        description: form.description,
        mealType: form.mealType,
        calories: totals.calories,
        proteinG: totals.proteinG || undefined,
        carbsG: totals.carbsG || undefined,
        fatG: totals.fatG || undefined,
        confidence: initialData.confidence,
        imageUrl,
        ingredients: ingredients.map((ingredient) => ({
          name: ingredient.name,
          weightG: ingredient.weightG,
          calories: ingredient.calories,
          proteinG: ingredient.proteinG,
          carbsG: ingredient.carbsG,
          fatG: ingredient.fatG,
        })),
      });

      if (!result.success) {
        setError(
          (dictionary.nutrition[result.error as keyof typeof dictionary.nutrition] as string | undefined) ??
            dictionary.errors.generic
        );
        return;
      }

      router.refresh();
    });
  }

  const mealTypeOptions = [
    {
      value: "BREAKFAST",
      label: dictionary.nutrition.mealTypeBreakfast,
      icon: Sun,
    },
    {
      value: "LUNCH",
      label: dictionary.nutrition.mealTypeLunch,
      icon: Sunset,
    },
    {
      value: "DINNER",
      label: dictionary.nutrition.mealTypeDinner,
      icon: Moon,
    },
    {
      value: "OTHER",
      label: dictionary.nutrition.mealTypeOther,
      icon: MoreHorizontal,
    },
  ] as const;

  return (
    <div className="rounded-2xl bg-[#2c2c2c] p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column: image, reference, description, meal type */}
        <div className="space-y-5">
          <div className="relative h-64 overflow-hidden rounded-xl bg-[#212121]">
            <Image
              src={imageUrl}
              alt={dictionary.nutrition.title}
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          {initialData.referenceScale.detected ? (
            <div className="flex items-center gap-2 rounded-xl bg-[#1a4a1a]/40 px-4 py-2.5 text-sm font-medium text-[#55eb55]">
              <Search className="h-4 w-4" />
              {dictionary.nutrition.referenceDetected}: {initialData.referenceScale.type}
            </div>
          ) : needsReferenceWarning && !referenceDismissed ? (
            <div className="rounded-xl bg-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-200">
                    {dictionary.nutrition.referenceNotDetected}
                  </p>
                  <p className="mt-1 text-xs text-amber-300/80">
                    {dictionary.nutrition.referenceWarning}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReferenceDismissed(true)}
                  className="text-xs font-medium text-amber-300 underline hover:text-amber-200"
                >
                  {dictionary.nutrition.continueAnyway}
                </button>
              </div>
            </div>
          ) : null}

          <div>
            <label
              htmlFor="meal-description"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              {dictionary.nutrition.description}:
            </label>
            <input
              id="meal-description"
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={isPending || isAdjusting}
              className="block w-full rounded-xl border border-white/10 bg-[#212121] px-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#55eb55] focus:outline-none focus:ring-1 focus:ring-[#55eb55] disabled:opacity-60"
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-white/80">
              {dictionary.nutrition.mealType}:
            </p>
            <div className="flex flex-wrap gap-3">
              {mealTypeOptions.map((option) => {
                const selected = form.mealType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, mealType: option.value as typeof form.mealType })
                    }
                    disabled={isPending || isAdjusting}
                    aria-pressed={selected}
                    className={`flex flex-col items-center gap-2 rounded-2xl p-3 transition-colors disabled:opacity-60 ${
                      selected
                        ? "bg-[#55eb55] text-white"
                        : "bg-[#3c3c3c] text-white/80 hover:bg-[#484848]"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        selected ? "bg-white/20" : "bg-[#2c2c2c]"
                      }`}
                    >
                      <option.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: macros, ingredients, actions */}
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
              {ingredients.map((ingredient, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 rounded-xl bg-[#212121] p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2c2c2c] text-[#55eb55]">
                    <UtensilsCrossed className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) =>
                        updateIngredientName(index, e.target.value)
                      }
                      disabled={isPending || isAdjusting}
                      className="w-full bg-transparent text-sm font-medium text-white placeholder-white/40 focus:outline-none disabled:opacity-60"
                    />
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-white/50">
                      <span>P {formatMacro(ingredient.proteinG)}</span>
                      <span>C {formatMacro(ingredient.carbsG)}</span>
                      <span>F {formatMacro(ingredient.fatG)}</span>
                      <span className="text-[#55eb55]">
                        {ingredient.calories} kcal
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={ingredient.weightG}
                        onChange={(e) =>
                          updateIngredientWeight(index, Number(e.target.value))
                        }
                        disabled={isPending || isAdjusting}
                        className="w-20 rounded-lg bg-[#2c2c2c] px-2 py-1.5 pr-6 text-right text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#55eb55] disabled:opacity-60"
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/40">
                        g
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      disabled={isPending || isAdjusting}
                      className="rounded-lg p-2 text-white/50 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-60"
                      aria-label={dictionary.nutrition.removeIngredient}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={adjustAndConfirm}
              disabled={isAdjusting || isPending}
              className="rounded-xl bg-[#55eb55] px-4 py-3 font-semibold text-black transition-colors hover:bg-[#45db45] disabled:opacity-60"
            >
              {isAdjusting
                ? dictionary.nutrition.adjusting
                : dictionary.nutrition.adjustAndConfirm}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || isAdjusting}
              className="rounded-xl bg-[#1a1a1a] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#111] disabled:opacity-60"
            >
              {isPending
                ? dictionary.nutrition.saving
                : dictionary.nutrition.saveToHistory}
            </button>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <p className="text-xs text-white/40">
            {dictionary.nutrition.disclaimer}
          </p>
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

function formatMacro(value: number | undefined): string {
  if (value == null) return "0";
  return value.toFixed(1);
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
