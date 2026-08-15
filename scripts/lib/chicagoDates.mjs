const CHICAGO = "America/Chicago";

export function chicagoToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CHICAGO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function parseYmd(ymd) {
  const [year, month, day] = String(ymd).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatYmd(date) {
  return date.toISOString().slice(0, 10);
}

export function maxYmd(a, b) {
  return a > b ? a : b;
}

export function upcomingMonthKeys(now = new Date(), count = 12) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CHICAGO,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  let year = Number(parts.find((part) => part.type === "year")?.value);
  let month = Number(parts.find((part) => part.type === "month")?.value);
  const keys = [];

  for (let i = 0; i < count; i += 1) {
    keys.push(`${String(month).padStart(2, "0")}-${year}`);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return keys;
}

/** weekdays: 0 = Sunday … 6 = Saturday, using the calendar date not local TZ. */
export function weekdayDates(startYmd, endYmd, weekdays) {
  const dates = [];
  const end = parseYmd(endYmd);
  const cursor = parseYmd(startYmd);

  while (cursor <= end) {
    if (weekdays.includes(cursor.getUTCDay())) {
      dates.push(formatYmd(cursor));
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}
