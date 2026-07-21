"use client";

import { useState, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import type { AnalyzeFoodImageResult } from "./actions";
import { FoodPhotoUpload } from "@/components/food/food-photo-upload";
import { FoodAnalysisResult } from "@/components/food/food-analysis-result";
import { MealHistoryList } from "@/components/food/meal-history-list";
import { MealEntryDetail } from "@/components/food/meal-entry-detail";
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
  const [selectedHistoryEntry, setSelectedHistoryEntry] =
    useState<MealEntryListItem | null>(null);

  const { count, totalKcal } = useMemo(() => {
    return initialEntries.reduce(
      (acc, entry) => ({
        count: acc.count + 1,
        totalKcal: acc.totalKcal + entry.calories,
      }),
      { count: 0, totalKcal: 0 }
    );
  }, [initialEntries]);

  const summaryText = dictionary.nutrition.todaySummary
    .replace("{count}", String(count))
    .replace("{totalKcal}", String(totalKcal));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {dictionary.nutrition.title}
        </h1>
        <p className="mt-2 text-white/60">
          {dictionary.nutrition.subtitle}
        </p>
      </div>

      {selectedHistoryEntry ? (
        <MealEntryDetail
          entry={selectedHistoryEntry}
          dictionary={dictionary}
          onClose={() => setSelectedHistoryEntry(null)}
        />
      ) : analysis ? (
        <FoodAnalysisResult
          dictionary={dictionary}
          initialData={analysis.data}
          imageUrl={analysis.imageUrl}
          needsReferenceWarning={analysis.needsReferenceWarning}
        />
      ) : (
        <div className="rounded-2xl bg-[#2c2c2c] p-6">
          <FoodPhotoUpload dictionary={dictionary} onAnalysis={setAnalysis} />
        </div>
      )}

      <div className="flex items-center justify-center rounded-2xl bg-[#2c2c2c] p-6">
        <div className="flex items-center gap-3 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#55eb55]/10">
            <BarChart3 className="h-5 w-5 text-[#55eb55]" />
          </div>
          <p className="text-sm font-medium text-white/90">
            {summaryText}
          </p>
        </div>
      </div>

      <MealHistoryList
        dictionary={dictionary}
        entries={initialEntries}
        onSelectEntry={setSelectedHistoryEntry}
      />
    </div>
  );
}
