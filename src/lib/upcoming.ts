import type { Activity, DayOfWeek, RestaurantOffer } from "@/types";
import {
  activityMatchesFilters,
  type DiscoveryFilters,
} from "@/lib/activityFacets";
import {
  chicagoTodayYmd,
  datesForIntent,
  hasActivityEnded,
  weekdayNamesForDates,
  type DateIntent,
} from "@/lib/chicagoTime";

export type HomeQuickList = {
  title: string;
  emptyMessage: string;
  activities: Activity[];
};

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

export function filterActiveActivities(
  allActivities: Activity[],
  now = new Date(),
): Activity[] {
  return allActivities.filter((activity) => !hasActivityEnded(activity, now));
}

export function filterActivitiesByDates(
  allActivities: Activity[],
  dates: Iterable<string>,
  now = new Date(),
): Activity[] {
  const dateSet = new Set(dates);
  return filterActiveActivities(allActivities, now)
    .filter((activity) => dateSet.has(activity.date))
    .sort(compareActivities);
}

export function getActivitiesForIntent(
  allActivities: Activity[],
  intent: DateIntent,
  now = new Date(),
): Activity[] {
  const today = chicagoTodayYmd(now);
  return filterActivitiesByDates(
    allActivities,
    datesForIntent(intent, today),
    now,
  );
}

export function getTodaysActivities(
  allActivities: Activity[],
  limit = 8,
  now = new Date(),
): Activity[] {
  return getActivitiesForIntent(allActivities, "today", now).slice(0, limit);
}

export function getHomeQuickLists(
  allActivities: Activity[],
  limit = 5,
  now = new Date(),
): { primary: HomeQuickList; secondary: HomeQuickList } {
  const today = getTodaysActivities(allActivities, limit, now);
  const weekend = getActivitiesForIntent(
    allActivities,
    "weekend",
    now,
  ).slice(0, limit);

  return {
    primary: {
      title: "Today",
      emptyMessage: "Nothing listed for today yet.",
      activities: today,
    },
    secondary: {
      title: "This weekend",
      emptyMessage: "Nothing listed for this weekend yet.",
      activities: weekend,
    },
  };
}

export function getUpcomingActivities(
  allActivities: Activity[],
  limit = 3,
  now = new Date(),
): Activity[] {
  return filterActiveActivities(allActivities, now)
    .sort(compareActivities)
    .slice(0, limit);
}

export function offersForDates(
  allOffers: RestaurantOffer[],
  dates: string[],
): RestaurantOffer[] {
  const days = new Set<DayOfWeek>(weekdayNamesForDates(dates));
  return allOffers.filter((offer) =>
    offer.eligibleDays.some((day) => days.has(day)),
  );
}

export function getUpcomingRestaurantOffers(
  allOffers: RestaurantOffer[],
  limit = 2,
  now = new Date(),
): RestaurantOffer[] {
  const today = chicagoTodayYmd(now);
  return offersForDates(allOffers, datesForIntent("today", today)).slice(
    0,
    limit,
  );
}

export function discoverActivities(
  allActivities: Activity[],
  intent: DateIntent,
  filters: DiscoveryFilters,
  now = new Date(),
): Activity[] {
  return getActivitiesForIntent(allActivities, intent, now).filter(
    (activity) => activityMatchesFilters(activity, filters),
  );
}
