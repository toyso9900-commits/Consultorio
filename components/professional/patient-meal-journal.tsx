import Image from "next/image";
import { Utensils } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type MealEntry = {
  id: string;
  imageUrl: string | null;
  description: string;
  mealType: string;
  consumedAt: Date;
};

type PatientMealJournalProps = {
  meals: MealEntry[];
  locale: string;
  dictionary: Dictionary;
};

function getMealTypeLabel(
  mealType: string,
  nutrition: Dictionary["nutrition"]
): string {
  switch (mealType) {
    case "BREAKFAST":
      return nutrition.mealTypeBreakfast;
    case "LUNCH":
      return nutrition.mealTypeLunch;
    case "DINNER":
      return nutrition.mealTypeDinner;
    case "SNACK":
      return nutrition.mealTypeSnack;
    default:
      return nutrition.mealTypeOther;
  }
}

function formatMealDate(date: Date, locale: string): string {
  if (locale === "en") {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  }

  const months = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

export function PatientMealJournal({
  meals,
  locale,
  dictionary,
}: PatientMealJournalProps) {
  const slots = Array.from({ length: 6 }, (_, index) => meals[index] ?? null);
  const t = dictionary.professionalClients;
  const nutrition = dictionary.nutrition;

  const placeholderLabels = [
    t.placeholderMeal1,
    t.placeholderMeal2,
    t.placeholderMeal3,
    t.placeholderMeal4,
    t.placeholderMeal5,
    t.placeholderMeal6,
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-card-foreground">
        {t.mealJournalTitle}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {slots.map((meal, index) => {
          const label = meal
            ? `${getMealTypeLabel(meal.mealType, nutrition)}: ${meal.description}`
            : placeholderLabels[index];

          return (
            <div
              key={meal?.id ?? `meal-placeholder-${index}`}
              className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-3"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                {meal?.imageUrl ? (
                  <Image
                    src={meal.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Utensils className="h-8 w-8" />
                    <span className="text-xs">{t.photoTag}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-card-foreground">
                  {label}
                </p>
                {meal && (
                  <p className="text-xs text-muted-foreground">
                    {formatMealDate(meal.consumedAt, locale)}
                  </p>
                )}
                <textarea
                  readOnly
                  rows={2}
                  placeholder={t.placeholderMealComment}
                  className="w-full resize-none rounded-md border border-border bg-background px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
