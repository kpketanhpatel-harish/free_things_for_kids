const CHICAGO = "America/Chicago";

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type DateIntent = "today" | "tomorrow" | "weekend";

export function chicagoTodayYmd(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CHICAGO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function chicagoWeekdayIndex(now = new Date()): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: CHICAGO,
    weekday: "short",
  }).format(now);
  const index = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    weekday,
  );
  return index === -1 ? 0 : index;
}

export function chicagoMinutesSinceMidnight(now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CHICAGO,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0,
  );
  return hour * 60 + minute;
}

export function addDaysYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function weekdayIndexForYmd(ymd: string): number {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function weekdayNameForYmd(
  ymd: string,
): (typeof DAY_NAMES)[number] {
  return DAY_NAMES[weekdayIndexForYmd(ymd)];
}

/** Minutes from a stored `HH:MM` or `H:MM AM/PM` time. */
export function parseTimeToMinutes(value: string | undefined): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  const ampm = trimmed.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (ampm) {
    let hours = Number(ampm[1]) % 12;
    if (/pm/i.test(ampm[3])) hours += 12;
    return hours * 60 + Number(ampm[2]);
  }
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function formatClockTime(value: string | undefined): string | null {
  const minutes = parseTimeToMinutes(value);
  if (minutes == null) return null;
  const hour24 = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

export function formatTimeRange(
  startTime?: string,
  endTime?: string,
): string {
  const start = formatClockTime(startTime);
  if (!start) return "Time TBA";
  const end = formatClockTime(endTime);
  return end ? `${start}–${end}` : start;
}

export type ActivityTiming = {
  date: string;
  startTime?: string;
  endTime?: string;
};

export function hasActivityEnded(
  activity: ActivityTiming,
  now = new Date(),
): boolean {
  const today = chicagoTodayYmd(now);
  if (activity.date < today) return true;
  if (activity.date > today) return false;

  const start = parseTimeToMinutes(activity.startTime);
  if (start == null) return false;

  const end =
    parseTimeToMinutes(activity.endTime) ?? start + 60;
  return chicagoMinutesSinceMidnight(now) >= end;
}

/** Upcoming Sat + Sun. On Saturday/Sunday this is the remainder of the current weekend. */
export function weekendDatesFor(todayYmd: string): string[] {
  const day = weekdayIndexForYmd(todayYmd);
  if (day === 0) return [todayYmd];
  if (day === 6) return [todayYmd, addDaysYmd(todayYmd, 1)];
  const daysUntilSaturday = 6 - day;
  const saturday = addDaysYmd(todayYmd, daysUntilSaturday);
  return [saturday, addDaysYmd(saturday, 1)];
}

export function datesForIntent(
  intent: DateIntent,
  todayYmd: string,
): string[] {
  if (intent === "today") return [todayYmd];
  if (intent === "tomorrow") return [addDaysYmd(todayYmd, 1)];
  return weekendDatesFor(todayYmd);
}

export function weekdayNamesForDates(
  dates: string[],
): Array<(typeof DAY_NAMES)[number]> {
  return [...new Set(dates.map((date) => weekdayNameForYmd(date)))];
}
