import type { Activity } from "@/types";
import { fingerprint } from "@/lib/dedupeActivities";

export type CalendarEventType = "all-day" | "recurring" | "one-off";

export type CalendarDayCell = {
  date: string;
  inMonth: boolean;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const SERIES_ID_PATTERN =
  /^local:(gcm-lincoln|roscoe-books|three-avenues|lp-farmers-market|lrvcc):/;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatYearMonth(year: number, month: number): string {
  return `${year}-${pad2(month)}`;
}

export function chicagoYearMonth(now = new Date()): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
  };
}

export function parseMonthParam(
  raw: string | undefined,
  now = new Date(),
): { year: number; month: number } {
  const match = raw?.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (month >= 1 && month <= 12) {
      return { year, month };
    }
  }
  return chicagoYearMonth(now);
}

export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

export function addDaysYmd(ymd: string, delta: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + delta));
  return date.toISOString().slice(0, 10);
}

export function monthGridRange(year: number, month: number): {
  gridStart: string;
  gridEnd: string;
} {
  const first = `${year}-${pad2(month)}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const last = `${year}-${pad2(month)}-${pad2(lastDay)}`;
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const lastWeekday = new Date(Date.UTC(year, month - 1, lastDay)).getUTCDay();
  return {
    gridStart: addDaysYmd(first, -firstWeekday),
    gridEnd: addDaysYmd(last, 6 - lastWeekday),
  };
}

export function buildCalendarDays(year: number, month: number): CalendarDayCell[] {
  const { gridStart, gridEnd } = monthGridRange(year, month);
  const prefix = `${year}-${pad2(month)}`;
  const days: CalendarDayCell[] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    days.push({ date: cursor, inMonth: cursor.startsWith(prefix) });
    cursor = addDaysYmd(cursor, 1);
  }
  return days;
}

export function weekdayLabels(): readonly string[] {
  return WEEKDAYS;
}

export function shortenCalendarTitle(title: string): string {
  const cleaned = title
    .replace(/\s+@\s+/g, " ")
    .replace(/\s+at\s+.+$/i, "")
    .replace(/[:–—].+$/, "")
    .trim();
  return cleaned.split(/\s+/).filter(Boolean).slice(0, 3).join(" ");
}

export function shortVenueLabel(venue: string): string {
  const raw = venue.replace(/,.*$/, "").trim();
  if (!raw || raw === "See event page") return "See page";

  const rules: [RegExp, string][] = [
    [/lincoln belmont/i, "CPL Belmont"],
    [/lincoln park library/i, "CPL Lincoln"],
    [/\bmerlo\b/i, "Merlo"],
    [/green city market/i, "Green City"],
    [/lincoln park farmers market/i, "LP Market"],
    [/roscoe village farmers market/i, "RV Market"],
    [/three avenues/i, "Three Avenues"],
    [/roscoe books/i, "Roscoe Books"],
    [/hamlin/i, "Hamlin"],
    [/wrightwood/i, "Wrightwood"],
    [/gill/i, "Gill"],
    [/trebes/i, "Trebes"],
    [/donahue/i, "Donahue"],
    [/lowline/i, "Lowline"],
  ];

  for (const [pattern, label] of rules) {
    if (pattern.test(raw)) return label;
  }

  return raw.split(/\s+/).slice(0, 2).join(" ");
}

export function formatPillTime(startTime?: string): string {
  if (!startTime) return "All day";
  const match = startTime.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return startTime;
  return `${Number(match[1])}:${match[2]}`;
}

export function getActivityEmoji(activity: Pick<Activity, "title" | "icon" | "venue">): string {
  const text = `${activity.title} ${activity.venue}`.toLowerCase();
  if (/story|library|book|rhyme|goose/.test(text)) return "📚";
  if (/art|craft|draw|paint|canvas/.test(text)) return "🎨";
  if (/market|farmers|food|taco|brunch/.test(text)) return "🍽️";
  if (/movie|film|screen|cinema/.test(text)) return "🎬";
  if (/nature|park|outdoor|garden|hike/.test(text)) return "🌳";
  if (/music|concert|orchestra|jazz|choir/.test(text)) return "🎵";
  if (/truck|fire station|construction|touch-a-truck/.test(text)) return "🚒";
  if (/sport|soccer|baseball|basketball|swim|tumbling|boxing/.test(text)) {
    return "⚽";
  }
  if (/animal|zoo|pet|paw/.test(text)) return "🐾";
  if (/fest|festival|carnival|parade|halloween|trick or treat/.test(text)) {
    return "🎉";
  }
  if (/science|stem|robot/.test(text)) return "🔬";
  if (activity.icon && activity.icon !== "✨") return activity.icon;
  return "✨";
}

export function isGeneratedSeries(id: string): boolean {
  return SERIES_ID_PATTERN.test(id);
}

export function recurringTitleSet(activities: Activity[]): Set<string> {
  const counts = new Map<string, number>();
  for (const activity of activities) {
    const key = fingerprint(activity.title);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([key]) => key),
  );
}

export function getCalendarEventType(
  activity: Activity,
  recurringTitles: Set<string>,
): CalendarEventType {
  if (!activity.startTime) return "all-day";
  if (
    isGeneratedSeries(activity.id) ||
    recurringTitles.has(fingerprint(activity.title))
  ) {
    return "recurring";
  }
  return "one-off";
}

export function groupActivitiesByDate(
  activities: Activity[],
): Map<string, Activity[]> {
  const groups = new Map<string, Activity[]>();
  for (const activity of activities) {
    const list = groups.get(activity.date) ?? [];
    list.push(activity);
    groups.set(activity.date, list);
  }
  for (const list of groups.values()) {
    list.sort((a, b) =>
      (a.startTime ?? "").localeCompare(b.startTime ?? ""),
    );
  }
  return groups;
}

export function monthTitle(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
