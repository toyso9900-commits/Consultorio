"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Trash2, AlertTriangle } from "lucide-react";
import { saveMealEntry, type FoodAnalysisData } from "@/app/paciente/dashboard/nutricion/actions";
import {
  calculateIngredientCalories,
  calculateIngredientMacro,
  findNutrientByNameFuzzy,
} from "@/lib/nutrition-data";
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
    { value: "BREAKFAST", label: dictionary.nutrition.mealTypeBreakfast },
    { value: "LUNCH", label: dictionary.nutrition.mealTypeLunch },
    { value: "DINNER", label: dictionary.nutrition.mealTypeDinner },
    { value: "SNACK", label: dictionary.nutrition.mealTypeSnack },
    { value: "OTHER", label: dictionary.nutrition.mealTypeOther },
  ] as const;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {dictionary.nutrition.title}
      </h3>

      {imageUrl && (
        <div className="relative h-48 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <Image
            src={imageUrl}
            alt="Analyzed meal"
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      )}

      {needsReferenceWarning && !referenceDismissed && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {dictionary.nutrition.referenceNotDetected}
              </p>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                {dictionary.nutrition.referenceWarning}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReferenceDismissed(true)}
              className="text-xs font-medium text-amber-700 underline hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
            >
              {dictionary.nutrition.continueAnyway}
            </button>
          </div>
        </div>
      )}

      {initialData.referenceScale.detected && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          {dictionary.nutrition.referenceScale}: {initialData.referenceScale.type}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.nutrition.description}
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            disabled={isPending}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.nutrition.mealType}
          </label>
          <select
            value={form.mealType}
            onChange={(e) =>
              setForm({ ...form, mealType: e.target.value as typeof form.mealType })
            }
            disabled={isPending}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {mealTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          {dictionary.nutrition.ingredients}
        </h4>
        <ul className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <li
              key={index}
              className="grid grid-cols-12 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800"
            >
              <div className="col-span-5">
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => updateIngredientName(index, e.target.value)}
                  disabled={isPending}
                  className="block w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="col-span-3">
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={ingredient.weightG}
                    onChange={(e) =>
                      updateIngredientWeight(index, Number(e.target.value))
                    }
                    disabled={isPending}
                    className="block w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 pr-6 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                    g
                  </span>
                </div>
              </div>
              <div className="col-span-3 text-right text-xs text-slate-600 dark:text-slate-400">
                <p>{ingredient.calories} kcal</p>
                <p>
                  P {formatMacro(ingredient.proteinG)} · C {formatMacro(ingredient.carbsG)} · F{" "}
                  {formatMacro(ingredient.fatG)}
                </p>
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  disabled={isPending}
                  className="rounded-md p-1 text-slate-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-60 dark:hover:bg-red-950 dark:hover:text-red-300"
                  aria-label={dictionary.nutrition.removeIngredient}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.nutrition.calories}
          </p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {totals.calories} kcal
          </p>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-slate-600 dark:text-slate-400">
          <p>
            {dictionary.nutrition.protein}: {formatMacro(totals.proteinG)} g
          </p>
          <p>
            {dictionary.nutrition.carbs}: {formatMacro(totals.carbsG)} g
          </p>
          <p>
            {dictionary.nutrition.fat}: {formatMacro(totals.fatG)} g
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        {dictionary.nutrition.disclaimer}
      </p>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
      >
        <Save className="h-4 w-4" />
        {isPending ? dictionary.nutrition.saving : dictionary.nutrition.save}
      </button>
    </div>
  );
}

function formatMacro(value: number | undefined): string {
  if (value == null) return "-";
  return value.toFixed(1);
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
