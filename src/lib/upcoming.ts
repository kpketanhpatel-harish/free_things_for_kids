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

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayAndTomorrow(): { today: Date; tomorrow: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return { today, tomorrow };
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

  return allActivities
    .filter((activity) => upcomingDates.has(activity.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
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
