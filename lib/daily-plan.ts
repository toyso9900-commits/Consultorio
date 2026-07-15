import { RoutineItemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  dateOnlyUtc,
  localDateString,
  utcWindowForLocalDate,
} from "@/lib/day-boundaries";

/**
 * Read model for the patient daily plan tracker (DPT-001, DPT-002, DPT-005).
 *
 * Lazy daily reset: a new user-local day simply has no completion rows, so
 * counts default to 0 — no scheduled jobs. The caller passes the session
 * patient's id and the routine ids already gated by subscription, so
 * cross-patient reads are impossible by construction.
 *
 * Slice roadmap: S3 adds streak + weekly fields. Keep this signature
 * stable for that extension.
 *
 * AUTO_MEALS (DPT-006): never persisted — the count is derived read-time
 * from MealEntry rows whose consumedAt falls inside the patient's current
 * local day (a UTC window computed from the user's IANA zone). Backdated
 * or deleted meals therefore recompute correctly on every load. The count
 * is patient-level (any mealType), so every AUTO_MEALS item across the
 * patient's routines shows the same "meals logged today" figure.
 */

export interface DailyPlanItem {
  id: string;
  type: RoutineItemType;
  title: string;
  icon: string;
  goal: number | null;
  /** CHECK: 0/1 · WATER: ml logged today · AUTO_MEALS: meals logged today. */
  count: number;
  satisfied: boolean;
  /** AUTO_MEALS is derived read-time; manual toggling is never allowed. */
  readOnly: boolean;
}

export interface RoutineDailyPlan {
  routineId: string;
  items: DailyPlanItem[];
}

export async function getDailyPlanForPatient(
  patientId: string,
  routineIds: string[],
  tz: string | null
): Promise<RoutineDailyPlan[]> {
  if (routineIds.length === 0) return [];

  const todayStr = localDateString(new Date(), tz);
  const today = dateOnlyUtc(todayStr);

  const [items, completions] = await Promise.all([
    prisma.routineItem.findMany({
      where: { routineId: { in: routineIds } },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        routineId: true,
        type: true,
        title: true,
        icon: true,
        goal: true,
      },
    }),
    prisma.routineItemCompletion.findMany({
      where: {
        patientId,
        date: today,
        item: { routineId: { in: routineIds } },
      },
      select: { itemId: true, count: true },
    }),
  ]);

  // DPT-006: count MealEntry rows in the patient's current local day only
  // when an AUTO_MEALS item exists — the query is skipped otherwise.
  const hasAutoMeals = items.some(
    (item) => item.type === RoutineItemType.AUTO_MEALS
  );
  const mealsWindow = hasAutoMeals ? utcWindowForLocalDate(todayStr, tz) : null;
  const mealsToday = mealsWindow
    ? await prisma.mealEntry.count({
        where: {
          userId: patientId,
          consumedAt: { gte: mealsWindow.start, lt: mealsWindow.end },
        },
      })
    : 0;

  const countByItemId = new Map(completions.map((c) => [c.itemId, c.count]));
  const itemsByRoutineId = new Map<string, DailyPlanItem[]>();

  for (const item of items) {
    const isAutoMeals = item.type === RoutineItemType.AUTO_MEALS;
    const count = isAutoMeals ? mealsToday : (countByItemId.get(item.id) ?? 0);
    const satisfied =
      item.type === RoutineItemType.CHECK
        ? count >= 1
        : item.goal != null && count >= item.goal;

    const list = itemsByRoutineId.get(item.routineId) ?? [];
    list.push({
      id: item.id,
      type: item.type,
      title: item.title,
      icon: item.icon,
      goal: item.goal,
      count,
      satisfied,
      readOnly: item.type === RoutineItemType.AUTO_MEALS,
    });
    itemsByRoutineId.set(item.routineId, list);
  }

  // Every requested routine appears, even with zero authored items, so the
  // UI can render the empty-tracker state (REQ-007).
  return routineIds.map((routineId) => ({
    routineId,
    items: itemsByRoutineId.get(routineId) ?? [],
  }));
}
