import { RoutineItemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  dateOnlyUtc,
  localDateString,
  shiftDays,
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
 * AUTO_MEALS (DPT-006): never persisted — the count is derived read-time
 * from MealEntry rows whose consumedAt falls inside the patient's local
 * day (a UTC window computed from the user's IANA zone). Backdated or
 * deleted meals therefore recompute correctly on every load. The count is
 * patient-level (any mealType), so every AUTO_MEALS item across the
 * patient's routines shows the same "meals logged today" figure.
 *
 * Streaks (DPT-007): read-time walk-back per routine, capped at
 * STREAK_MAX_DAYS. A complete day = every CHECK count>=1 AND every WATER
 * count>=goal AND every AUTO_MEALS with >=goal MealEntry rows that local
 * date. An in-progress today never breaks the streak: when today is not
 * complete yet, the walk starts at yesterday. All boundaries use the
 * user's CURRENT timezone, so a mid-streak timezone change simply rebases
 * subsequent evaluations (no stored streak to invalidate).
 *
 * Weekly view (DPT-008): Monday–Sunday of the user's current local week,
 * each day classified as complete / partial / empty / future. Purely
 * derived at read time — no cron, no snapshots.
 */

/** Upper bound for the streak walk-back (DPT-007). */
const STREAK_MAX_DAYS = 365;

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

export type WeekDayState = "complete" | "partial" | "empty" | "future";

export interface WeekDay {
  /** User-local calendar date, "YYYY-MM-DD". */
  date: string;
  state: WeekDayState;
  isToday: boolean;
}

export interface RoutineDailyPlan {
  routineId: string;
  items: DailyPlanItem[];
  /** Consecutive complete days ending today (or yesterday if today is still in progress). */
  streak: number;
  /** Monday–Sunday of the current user-local week. */
  week: WeekDay[];
}

/**
 * Minimal shape of a RoutineItem row used by the day evaluators. Matches
 * the Prisma select below; structural typing keeps helpers pure.
 */
interface PlanItemRow {
  id: string;
  routineId: string;
  type: RoutineItemType;
  title: string;
  icon: string;
  goal: number | null;
}

/** Per-date tallies shared by every day evaluation in one read. */
interface DayTallies {
  /** itemId -> (localDate -> summed completion count). */
  countByItem: Map<string, Map<string, number>>;
  /** localDate -> MealEntry rows that day (patient-level, any mealType). */
  mealCountByDate: Map<string, number>;
}

function itemSatisfiedOn(
  item: PlanItemRow,
  dateStr: string,
  tallies: DayTallies
): boolean {
  if (item.type === RoutineItemType.AUTO_MEALS) {
    return (
      item.goal != null && (tallies.mealCountByDate.get(dateStr) ?? 0) >= item.goal
    );
  }
  const count = tallies.countByItem.get(item.id)?.get(dateStr) ?? 0;
  return item.type === RoutineItemType.CHECK
    ? count >= 1
    : item.goal != null && count >= item.goal;
}

function itemHasProgressOn(
  item: PlanItemRow,
  dateStr: string,
  tallies: DayTallies
): boolean {
  if (item.type === RoutineItemType.AUTO_MEALS) {
    return (tallies.mealCountByDate.get(dateStr) ?? 0) > 0;
  }
  return (tallies.countByItem.get(item.id)?.get(dateStr) ?? 0) > 0;
}

/**
 * A complete day requires at least one item — a routine with zero authored
 * items never accrues streak (DPT-007).
 */
function isCompleteDay(
  items: PlanItemRow[],
  dateStr: string,
  tallies: DayTallies
): boolean {
  return (
    items.length > 0 &&
    items.every((item) => itemSatisfiedOn(item, dateStr, tallies))
  );
}

/**
 * Consecutive complete days walking back from today. An incomplete today
 * is skipped (the day is still in progress), never counted as a miss.
 */
function computeStreak(
  items: PlanItemRow[],
  todayStr: string,
  tallies: DayTallies
): number {
  let cursor = isCompleteDay(items, todayStr, tallies)
    ? todayStr
    : shiftDays(todayStr, -1);

  let streak = 0;
  for (let i = 0; i < STREAK_MAX_DAYS; i++) {
    if (!isCompleteDay(items, cursor, tallies)) break;
    streak++;
    cursor = shiftDays(cursor, -1);
  }
  return streak;
}

function buildWeek(
  items: PlanItemRow[],
  todayStr: string,
  tallies: DayTallies
): WeekDay[] {
  // Weekday of a "YYYY-MM-DD" string is timezone-independent: anchor it to
  // UTC so Monday offset is pure calendar math (0 = Monday … 6 = Sunday).
  const mondayOffset = (dateOnlyUtc(todayStr).getUTCDay() + 6) % 7;
  const weekStartStr = shiftDays(todayStr, -mondayOffset);

  return Array.from({ length: 7 }, (_, i) => {
    // Zero-padded date strings compare chronologically as plain strings.
    const date = shiftDays(weekStartStr, i);
    if (date > todayStr) {
      return { date, state: "future", isToday: false };
    }
    const state: WeekDayState = isCompleteDay(items, date, tallies)
      ? "complete"
      : items.some((item) => itemHasProgressOn(item, date, tallies))
        ? "partial"
        : "empty";
    return { date, state, isToday: date === todayStr };
  });
}

export async function getDailyPlanForPatient(
  patientId: string,
  routineIds: string[],
  tz: string | null
): Promise<RoutineDailyPlan[]> {
  if (routineIds.length === 0) return [];

  const todayStr = localDateString(new Date(), tz);
  const today = dateOnlyUtc(todayStr);
  const lookbackStart = dateOnlyUtc(shiftDays(todayStr, -STREAK_MAX_DAYS));

  // One range fetch covers today's state, the streak walk-back and the
  // weekly strip — completions are keyed by user-local date (UTC midnight).
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
        date: { gte: lookbackStart, lte: today },
        item: { routineId: { in: routineIds } },
      },
      select: { itemId: true, date: true, count: true },
    }),
  ]);

  // DPT-006/DPT-007: MealEntry timestamps for the whole lookback window,
  // bucketed per user-local date in JS — only when an AUTO_MEALS item
  // exists, otherwise the query is skipped entirely.
  const hasAutoMeals = items.some(
    (item) => item.type === RoutineItemType.AUTO_MEALS
  );
  const mealsWindow = hasAutoMeals
    ? {
        start: utcWindowForLocalDate(shiftDays(todayStr, -STREAK_MAX_DAYS), tz)
          .start,
        end: utcWindowForLocalDate(todayStr, tz).end,
      }
    : null;
  const mealEntries = mealsWindow
    ? await prisma.mealEntry.findMany({
        where: {
          userId: patientId,
          consumedAt: { gte: mealsWindow.start, lt: mealsWindow.end },
        },
        select: { consumedAt: true },
      })
    : [];

  const tallies: DayTallies = {
    countByItem: new Map(),
    mealCountByDate: new Map(),
  };
  for (const completion of completions) {
    // Dates are stored via dateOnlyUtc (UTC midnight), so the ISO prefix
    // is exactly the user-local calendar date they were written for.
    const dateStr = completion.date.toISOString().slice(0, 10);
    let perDate = tallies.countByItem.get(completion.itemId);
    if (!perDate) {
      perDate = new Map();
      tallies.countByItem.set(completion.itemId, perDate);
    }
    perDate.set(dateStr, (perDate.get(dateStr) ?? 0) + completion.count);
  }
  for (const entry of mealEntries) {
    const dateStr = localDateString(entry.consumedAt, tz);
    tallies.mealCountByDate.set(
      dateStr,
      (tallies.mealCountByDate.get(dateStr) ?? 0) + 1
    );
  }

  const itemsByRoutineId = new Map<string, PlanItemRow[]>();
  for (const item of items) {
    const list = itemsByRoutineId.get(item.routineId) ?? [];
    list.push(item);
    itemsByRoutineId.set(item.routineId, list);
  }

  const mealsToday = tallies.mealCountByDate.get(todayStr) ?? 0;

  // Every requested routine appears, even with zero authored items, so the
  // UI can render the empty-tracker state (REQ-007).
  return routineIds.map((routineId) => {
    const routineItems = itemsByRoutineId.get(routineId) ?? [];

    const planItems: DailyPlanItem[] = routineItems.map((item) => {
      const isAutoMeals = item.type === RoutineItemType.AUTO_MEALS;
      const count = isAutoMeals
        ? mealsToday
        : (tallies.countByItem.get(item.id)?.get(todayStr) ?? 0);
      return {
        id: item.id,
        type: item.type,
        title: item.title,
        icon: item.icon,
        goal: item.goal,
        count,
        satisfied: itemSatisfiedOn(item, todayStr, tallies),
        readOnly: isAutoMeals,
      };
    });

    return {
      routineId,
      items: planItems,
      streak: computeStreak(routineItems, todayStr, tallies),
      week: buildWeek(routineItems, todayStr, tallies),
    };
  });
}
