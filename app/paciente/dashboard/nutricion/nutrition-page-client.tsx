"use client";

import { useState } from "react";
import type { AnalyzeFoodImageResult } from "./actions";
import { FoodPhotoUpload } from "@/components/food/food-photo-upload";
import { FoodAnalysisResult } from "@/components/food/food-analysis-result";
import { MealHistoryList } from "@/components/food/meal-history-list";
import type { Dictionary } from "@/lib/i18n/server";
import type { MealEntryListItem } from "./actions";

interface NutritionPageClientProps {
  dictionary: Dictionary;
  initialEntries: MealEntryListItem[];
}

export function NutritionPageClient({
  dictionary,
  initialEntries,
}: NutritionPageClientProps) {
  const [analysis, setAnalysis] = useState<
    Extract<AnalyzeFoodImageResult, { success: true }> | null
  >(null);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          {dictionary.nutrition.title}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {dictionary.nutrition.subtitle}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <FoodPhotoUpload dictionary={dictionary} onAnalysis={setAnalysis} />
      </div>

      {analysis && (
        <FoodAnalysisResult
          dictionary={dictionary}
          initialData={analysis.data}
          imageUrl={analysis.imageUrl}
        />
      )}

      <MealHistoryList dictionary={dictionary} entries={initialEntries} />
    </div>
  );
}
