import { upcomingMonthKeys } from "../lib/chicagoDates.mjs";
import { parseLrvCalendarHtml } from "../lib/parseLrvCalendar.mjs";
import {
  generateGreenCityMarketLincoln,
  generateLincolnParkFarmersMarket,
  generateRoscoeBooksStoryTime,
  generateTasteOfLincoln,
  generateThreeAvenuesStoryTime,
  normalizeLrvEvent,
} from "../lib/normalizeLocalEvent.mjs";

const CALENDAR_URL =
  "https://www.lakeviewroscoevillage.org/events-calendar";

const USER_AGENT =
  "Free-Kid-List/0.1 (https://github.com/kpketanhpatel-harish/free_things_for_kids)";

export function buildLrvCalendarUrl(monthKey) {
  const params = new URLSearchParams({ view: "list", month: monthKey });
  return `${CALENDAR_URL}?${params.toString()}`;
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html",
      "User-Agent": USER_AGENT,
    },
  });
  if (!response.ok) {
    throw new Error(
      `Local calendar request failed (${response.status} ${response.statusText}) for ${url}`,
    );
  }
  return response.text();
}

export async function fetchLrvCalendarEvents({
  now = new Date(),
  monthCount = 12,
} = {}) {
  const monthKeys = upcomingMonthKeys(now, monthCount);
  const pages = await Promise.all(
    monthKeys.map((monthKey) => fetchHtml(buildLrvCalendarUrl(monthKey))),
  );
  const events = [];
  const seen = new Set();

  for (const html of pages) {
    for (const event of parseLrvCalendarHtml(html)) {
      const key = `${event.sourceUrl}|${event.date}`;
      if (seen.has(key)) continue;
      seen.add(key);
      events.push(event);
    }
  }

  return events;
}

export async function loadLocalActivities({ now = new Date() } = {}) {
  const calendarEvents = await fetchLrvCalendarEvents({ now });
  const normalized = calendarEvents.map((event) => normalizeLrvEvent(event));
  normalized.push(...generateGreenCityMarketLincoln(now));
  normalized.push(...generateRoscoeBooksStoryTime(now));
  normalized.push(...generateTasteOfLincoln(now));
  normalized.push(...generateThreeAvenuesStoryTime(now));
  normalized.push(...generateLincolnParkFarmersMarket(now));
  return normalized;
}
