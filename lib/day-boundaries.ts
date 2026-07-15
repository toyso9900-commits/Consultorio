/**
 * Timezone-aware day-boundary helpers for the daily plan tracker.
 *
 * Pure `Intl` math — zero dependencies, server+client safe. Calendar dates
 * are handled as "YYYY-MM-DD" strings so DST transitions never shift a stored
 * day: `@db.Date` columns are written via `dateOnlyUtc` (UTC midnight), which
 * is DST-safe by construction.
 *
 * A null timezone falls back to server-local boundaries (DPT-004), matching
 * legacy behavior for users without a detected/saved timezone.
 */

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

interface DateParts {
  year: number;
  month: number;
  day: number;
}

function parseDateString(dateStr: string): DateParts {
  const match = DATE_ONLY_PATTERN.exec(dateStr);
  if (!match) {
    throw new Error(`Invalid date string "${dateStr}"; expected "YYYY-MM-DD".`);
  }
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Calendar date ("YYYY-MM-DD") in `tz` — or server-local when null — that
 * contains instant `now`. An invalid IANA timezone throws RangeError (Intl);
 * callers only pass values already validated on write.
 */
export function localDateString(now: Date, tz: string | null): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    ...(tz ? { timeZone: tz } : {}),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  let year = "";
  let month = "";
  let day = "";
  for (const part of parts) {
    if (part.type === "year") year = part.value;
    else if (part.type === "month") month = part.value;
    else if (part.type === "day") day = part.value;
  }
  return `${year}-${month}-${day}`;
}

/**
 * Pure date-only arithmetic via UTC, so DST never affects the result.
 * `delta` may be negative. Month/year overflow is handled by Date.
 */
export function shiftDays(dateStr: string, delta: number): string {
  const { year, month, day } = parseDateString(dateStr);
  const shifted = new Date(Date.UTC(year, month - 1, day + delta));
  return `${shifted.getUTCFullYear()}-${pad2(shifted.getUTCMonth() + 1)}-${pad2(shifted.getUTCDate())}`;
}

/**
 * UTC-midnight Date for a calendar date — the canonical write value for
 * `@db.Date` columns (e.g. RoutineItemCompletion.date).
 */
export function dateOnlyUtc(dateStr: string): Date {
  const { year, month, day } = parseDateString(dateStr);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Offset in ms of `tz` ahead of UTC at instant `at` (positive east of
 * Greenwich), derived from Intl.DateTimeFormat parts.
 */
function tzOffsetMs(at: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);

  const fields: Partial<Record<string, string>> = {};
  for (const part of parts) {
    if (part.type !== "literal") fields[part.type] = part.value;
  }

  const asUtc = Date.UTC(
    Number(fields.year),
    Number(fields.month) - 1,
    Number(fields.day),
    Number(fields.hour),
    Number(fields.minute),
    Number(fields.second)
  );
  // Truncate to seconds: Intl parts carry no sub-second precision.
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

/**
 * UTC instant of local midnight at the start of `dateStr` in `tz`.
 * The zone offset is sampled at noon UTC of the target date — per design,
 * a ~1h error is tolerated on the rare DST-transition edge.
 */
function localMidnightUtc(dateStr: string, tz: string): Date {
  const { year, month, day } = parseDateString(dateStr);
  const noonUtc = new Date(Date.UTC(year, month - 1, day, 12));
  const offset = tzOffsetMs(noonUtc, tz);
  return new Date(Date.UTC(year, month - 1, day) - offset);
}

/**
 * Half-open UTC window [start, end) covering the local calendar date
 * `dateStr` in `tz` — or server-local when null. Use it to range-query
 * timestamp columns (e.g. MealEntry.consumedAt) by user-local day.
 */
export function utcWindowForLocalDate(
  dateStr: string,
  tz: string | null
): { start: Date; end: Date } {
  const { year, month, day } = parseDateString(dateStr);

  if (!tz) {
    // Server-local boundaries; Date arithmetic handles DST natively.
    return {
      start: new Date(year, month - 1, day),
      end: new Date(year, month - 1, day + 1),
    };
  }

  return {
    start: localMidnightUtc(dateStr, tz),
    end: localMidnightUtc(shiftDays(dateStr, 1), tz),
  };
}
