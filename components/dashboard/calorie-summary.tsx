import type { Dictionary } from "@/lib/i18n/server";

export interface CalorieSummaryProps {
  calories: number;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  goal: number;
  dictionary: Dictionary;
}

export function CalorieSummary({
  calories,
  proteinG,
  carbsG,
  fatG,
  goal,
  dictionary,
}: CalorieSummaryProps) {
  const progress = goal > 0 ? Math.min((calories / goal) * 100, 100) : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-card-foreground">
          {dictionary.patientHome.caloriesToday}
        </h2>
        <span className="text-sm text-muted-foreground">
          {dictionary.patientHome.calorieGoal}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold text-card-foreground">
          {calories}
          <span className="ml-1 text-base font-medium text-muted-foreground">
            / {goal} kcal
          </span>
        </p>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{progress.toFixed(0)}%</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MacroBar
          label={dictionary.nutrition.protein}
          value={proteinG ?? 0}
          color="bg-blue-500"
        />
        <MacroBar
          label={dictionary.nutrition.carbs}
          value={carbsG ?? 0}
          color="bg-amber-500"
        />
        <MacroBar
          label={dictionary.nutrition.fat}
          value={fatG ?? 0}
          color="bg-rose-500"
        />
      </div>
    </div>
  );
}

function MacroBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-muted p-3 text-center">
      <p className="min-h-[1rem] text-xs font-medium leading-tight text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-lg font-semibold leading-tight text-card-foreground">
        {value.toFixed(1)} g
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background">
        <div className={`h-full rounded-full ${color}`} style={{ width: "100%" }} />
      </div>
    </div>
  );
}
