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
        <h1 className="text-2xl font-bold text-card-foreground sm:text-3xl">
          {dictionary.nutrition.title}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {dictionary.nutrition.subtitle}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <FoodPhotoUpload dictionary={dictionary} onAnalysis={setAnalysis} />
      </div>

      {analysis && (
        <FoodAnalysisResult
          dictionary={dictionary}
          initialData={analysis.data}
          imageUrl={analysis.imageUrl}
          needsReferenceWarning={analysis.needsReferenceWarning}
        />
      )}

      <MealHistoryList dictionary={dictionary} entries={initialEntries} />
    </div>
  );
}
