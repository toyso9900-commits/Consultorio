"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { saveMealEntry, type FoodAnalysisData } from "@/app/paciente/dashboard/nutricion/actions";
import type { Dictionary } from "@/lib/i18n/server";

interface FoodAnalysisResultProps {
  dictionary: Dictionary;
  initialData: FoodAnalysisData;
  imageUrl: string;
}

export function FoodAnalysisResult({
  dictionary,
  initialData,
  imageUrl,
}: FoodAnalysisResultProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    description: initialData.description,
    mealType: "OTHER" as const,
    calories: initialData.calories,
    proteinG: initialData.proteinG ?? 0,
    carbsG: initialData.carbsG ?? 0,
    fatG: initialData.fatG ?? 0,
    confidence: initialData.confidence,
  });

  function handleSave() {
    setError(null);

    startTransition(async () => {
      const result = await saveMealEntry({
        description: form.description,
        mealType: form.mealType,
        calories: form.calories,
        proteinG: form.proteinG || undefined,
        carbsG: form.carbsG || undefined,
        fatG: form.fatG || undefined,
        confidence: form.confidence,
        imageUrl,
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
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <img
            src={imageUrl}
            alt="Analyzed meal"
            className="max-h-48 w-full object-cover"
          />
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

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.nutrition.calories}
          </label>
          <input
            type="number"
            min={0}
            value={form.calories}
            onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
            disabled={isPending}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.nutrition.protein} (g)
          </label>
          <input
            type="number"
            min={0}
            step="0.1"
            value={form.proteinG}
            onChange={(e) => setForm({ ...form, proteinG: Number(e.target.value) })}
            disabled={isPending}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.nutrition.carbs} (g)
          </label>
          <input
            type="number"
            min={0}
            step="0.1"
            value={form.carbsG}
            onChange={(e) => setForm({ ...form, carbsG: Number(e.target.value) })}
            disabled={isPending}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.nutrition.fat} (g)
          </label>
          <input
            type="number"
            min={0}
            step="0.1"
            value={form.fatG}
            onChange={(e) => setForm({ ...form, fatG: Number(e.target.value) })}
            disabled={isPending}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.nutrition.confidence}
          </label>
          <input
            type="number"
            min={0}
            max={1}
            step="0.01"
            value={form.confidence}
            onChange={(e) => setForm({ ...form, confidence: Number(e.target.value) })}
            disabled={isPending}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
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
