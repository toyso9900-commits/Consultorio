import { RoutineItemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { dateOnlyUtc, localDateString } from "@/lib/day-boundaries";

/**
 * Read model for the patient daily plan tracker (DPT-001, DPT-002, DPT-005).
 *
 * Lazy daily reset: a new user-local day simply has no completion rows, so
 * counts default to 0 — no scheduled jobs. The caller passes the session
 * patient's id and the routine ids already gated by subscription, so
 * cross-patient reads are impossible by construction.
 *
 * Slice roadmap: S2 derives AUTO_MEALS counts read-time from MealEntry;
 * S3 adds streak + weekly fields. Keep this signature stable for those
 * extensions.
 */

export interface DailyPlanItem {
  id: string;
  type: RoutineItemType;
  title: string;
  icon: string;
  goal: number | null;
  /** CHECK: 0/1 · WATER: ml logged today · AUTO_MEALS: 0 until S2 derives it. */
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

  const today = dateOnlyUtc(localDateString(new Date(), tz));

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

  const countByItemId = new Map(completions.map((c) => [c.itemId, c.count]));
  const itemsByRoutineId = new Map<string, DailyPlanItem[]>();

  for (const item of items) {
    const count = countByItemId.get(item.id) ?? 0;
    const satisfied =
      item.type === RoutineItemType.CHECK
        ? count >= 1
        : item.type === RoutineItemType.WATER
          ? item.goal != null && count >= item.goal
          : false; // AUTO_MEALS: derived read-time in S2.

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
