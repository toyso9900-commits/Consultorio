export type WeekStart = "monday" | "sunday";

export function getWeekStart(date: Date, startOfWeek: WeekStart = "monday"): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff =
    startOfWeek === "monday"
      ? day === 0
        ? -6
        : 1 - day
      : -day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekEnd(date: Date, startOfWeek: WeekStart = "monday"): Date {
  const start = getWeekStart(date, startOfWeek);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function isSameLocalDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getWeekDayLabels(_locale: string): string[] {
  // Spanish short labels used by the existing UI.
  return ["L", "M", "M", "J", "V", "S", "D"];
}

export function getWeekDayDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}
