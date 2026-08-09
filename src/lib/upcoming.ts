import type { Activity, DayOfWeek, RestaurantOffer } from "@/types";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type HomeQuickList = {
  title: string;
  emptyMessage: string;
  activities: Activity[];
};

export type HomeQuickLists = {
  primary: HomeQuickList;
  secondary: HomeQuickList;
};

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function getTodayAndTomorrow(): { today: Date; tomorrow: Date } {
  const today = startOfToday();
  return { today, tomorrow: addDays(today, 1) };
}

/** Upcoming Sat + Sun relative to `from` (never includes a Saturday already in the past). */
function getUpcomingWeekendDates(from: Date = startOfToday()): Date[] {
  const day = from.getDay(); // 0 = Sunday … 6 = Saturday
  const daysUntilSaturday = day === 0 ? 6 : 6 - day;
  const saturday = addDays(from, daysUntilSaturday);
  return [saturday, addDays(saturday, 1)];
}

function compareActivities(a: Activity, b: Activity): number {
  const byDate = a.date.localeCompare(b.date);
  if (byDate !== 0) return byDate;

  const aTime = a.startTime ?? "";
  const bTime = b.startTime ?? "";
  if (aTime !== bTime) {
    if (!aTime) return 1;
    if (!bTime) return -1;
    return aTime.localeCompare(bTime);
  }

  return a.title.localeCompare(b.title);
}

function filterActivitiesByDates(
  allActivities: Activity[],
  dates: Set<string>,
  limit: number,
): Activity[] {
  return allActivities
    .filter((activity) => dates.has(activity.date))
    .sort(compareActivities)
    .slice(0, limit);
}

export function getTodaysActivities(
  allActivities: Activity[],
  limit = 5,
): Activity[] {
  const today = startOfToday();
  return filterActivitiesByDates(
    allActivities,
    new Set([formatDateKey(today)]),
    limit,
  );
}

/**
 * Homepage top lists by weekday:
 * - Mon–Fri: Today | This weekend (upcoming Sat + Sun)
 * - Saturday: Today | Tomorrow (Sunday)
 * - Sunday: Today | Next weekend (following Sat + Sun)
 */
export function getHomeQuickLists(
  allActivities: Activity[],
  limit = 5,
): HomeQuickLists {
  const today = startOfToday();
  const day = today.getDay();

  const primary: HomeQuickList = {
    title: "Today",
    emptyMessage: "Nothing free listed for today.",
    activities: getTodaysActivities(allActivities, limit),
  };

  if (day === 6) {
    // Saturday → Tomorrow (Sunday)
    const tomorrow = addDays(today, 1);
    return {
      primary,
      secondary: {
        title: "Tomorrow",
        emptyMessage: "Nothing free listed for tomorrow.",
        activities: filterActivitiesByDates(
          allActivities,
          new Set([formatDateKey(tomorrow)]),
          limit,
        ),
      },
    };
  }

  if (day === 0) {
    // Sunday → Next weekend
    const nextWeekendDates = new Set(
      getUpcomingWeekendDates(today).map((date) => formatDateKey(date)),
    );
    return {
      primary,
      secondary: {
        title: "Next weekend",
        emptyMessage: "Nothing free listed for next weekend.",
        activities: filterActivitiesByDates(
          allActivities,
          nextWeekendDates,
          limit,
        ),
      },
    };
  }

  // Mon–Fri → This weekend
  const thisWeekendDates = new Set(
    getUpcomingWeekendDates(today).map((date) => formatDateKey(date)),
  );
  return {
    primary,
    secondary: {
      title: "This weekend",
      emptyMessage: "Nothing free listed for this weekend.",
      activities: filterActivitiesByDates(
        allActivities,
        thisWeekendDates,
        limit,
      ),
    },
  };
}

export function getUpcomingActivities(
  allActivities: Activity[],
  limit = 3,
): Activity[] {
  const { today, tomorrow } = getTodayAndTomorrow();
  const upcomingDates = new Set([
    formatDateKey(today),
    formatDateKey(tomorrow),
  ]);

  return filterActivitiesByDates(allActivities, upcomingDates, limit);
}

export function getUpcomingRestaurantOffers(
  allOffers: RestaurantOffer[],
  limit = 2,
): RestaurantOffer[] {
  const { today, tomorrow } = getTodayAndTomorrow();
  const upcomingDays = new Set<DayOfWeek>([
    DAY_NAMES[today.getDay()],
    DAY_NAMES[tomorrow.getDay()],
  ]);

  return allOffers
    .filter((offer) =>
      offer.eligibleDays.some((day) => upcomingDays.has(day)),
    )
    .slice(0, limit);
}
