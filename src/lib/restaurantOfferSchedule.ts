import type { DayOfWeek, RestaurantOffer } from "../types";
import {
  addDaysYmd,
  chicagoTodayYmd,
  weekdayNameForYmd,
  weekendDatesFor,
} from "./chicagoTime";

export type DateShortcut = "tonight" | "tomorrow" | "weekend" | "all";

export type UpcomingOfferGroup = {
  ymd: string;
  weekday: DayOfWeek;
  heading: string;
  offers: RestaurantOffer[];
};

export function offerIsEligibleOnYmd(
  offer: Pick<RestaurantOffer, "eligibleDays">,
  ymd: string,
): boolean {
  return (offer.eligibleDays ?? []).includes(weekdayNameForYmd(ymd));
}

export function nextEligibleYmd(
  offer: Pick<RestaurantOffer, "eligibleDays">,
  fromYmd: string,
  inclusive = true,
): string | null {
  if (!offer.eligibleDays?.length) return null;
  for (let offset = inclusive ? 0 : 1; offset <= 7; offset += 1) {
    const ymd = addDaysYmd(fromYmd, offset);
    if (offerIsEligibleOnYmd(offer, ymd)) return ymd;
  }
  return null;
}

export function nextEligibleWeekday(
  offer: Pick<RestaurantOffer, "eligibleDays">,
  fromYmd: string,
  inclusive = true,
): DayOfWeek | null {
  const ymd = nextEligibleYmd(offer, fromYmd, inclusive);
  return ymd ? weekdayNameForYmd(ymd) : null;
}

export function proximityLabel(todayYmd: string, ymd: string): string {
  if (ymd === todayYmd) return "Tonight";
  if (ymd === addDaysYmd(todayYmd, 1)) return "Tomorrow";
  return weekdayNameForYmd(ymd);
}

export function formatOfferHours(hours: string | undefined): string | null {
  if (!hours) return null;
  const trimmed = hours.trim();
  if (!trimmed || /^see offer details$/i.test(trimmed)) return null;
  if (/all\s*day/i.test(trimmed)) return "All day";
  if (/^brunch$/i.test(trimmed)) return "Brunch";
  if (/^dinner$/i.test(trimmed)) return "Dinner";
  if (/^evening$/i.test(trimmed)) return "Evening";
  return trimmed.replace(/\s*-\s*/g, "–").replace(/\s*–\s*/g, "–");
}

export function formatOfferWhen(
  offer: Pick<RestaurantOffer, "eligibleDays" | "eligibleHours">,
  now = new Date(),
  forYmd?: string,
): string {
  const today = chicagoTodayYmd(now);
  const ymd = forYmd ?? nextEligibleYmd(offer, today) ?? today;
  const label = proximityLabel(today, ymd);
  const hours = formatOfferHours(offer.eligibleHours);
  return hours ? `${label} · ${hours}` : label;
}

export function offersForShortcut(
  offers: RestaurantOffer[],
  shortcut: DateShortcut,
  now = new Date(),
): RestaurantOffer[] {
  const today = chicagoTodayYmd(now);
  if (shortcut === "all") return offers;
  if (shortcut === "tonight") {
    return offers.filter((offer) => offerIsEligibleOnYmd(offer, today));
  }
  if (shortcut === "tomorrow") {
    return offers.filter((offer) =>
      offerIsEligibleOnYmd(offer, addDaysYmd(today, 1)),
    );
  }
  return offers.filter((offer) =>
    weekendDatesFor(today).some((ymd) => offerIsEligibleOnYmd(offer, ymd)),
  );
}

export function upcomingGroupHeading(todayYmd: string, ymd: string): string {
  if (ymd === addDaysYmd(todayYmd, 1)) {
    return `Tomorrow — ${weekdayNameForYmd(ymd)}`;
  }
  return weekdayNameForYmd(ymd);
}

export function groupUpcomingOffers(
  offers: RestaurantOffer[],
  options?: {
    now?: Date;
    startFromYmd?: string;
    maxDays?: number;
    maxOffers?: number;
  },
): UpcomingOfferGroup[] {
  const now = options?.now ?? new Date();
  const today = chicagoTodayYmd(now);
  const startFromYmd = options?.startFromYmd ?? addDaysYmd(today, 1);
  const maxDays = options?.maxDays ?? 4;
  const maxOffers = options?.maxOffers ?? 10;

  const groups: UpcomingOfferGroup[] = [];
  const seen = new Set<string>();
  let count = 0;

  for (let offset = 0; offset < 14; offset += 1) {
    if (groups.length >= maxDays || count >= maxOffers) break;
    const ymd = addDaysYmd(startFromYmd, offset);
    const dayOffers = offers.filter(
      (offer) => !seen.has(offer.id) && offerIsEligibleOnYmd(offer, ymd),
    );
    if (dayOffers.length === 0) continue;

    const slice = dayOffers.slice(0, maxOffers - count);
    for (const offer of slice) seen.add(offer.id);
    groups.push({
      ymd,
      weekday: weekdayNameForYmd(ymd),
      heading: upcomingGroupHeading(today, ymd),
      offers: slice,
    });
    count += slice.length;
  }

  return groups;
}

export function ageHeadline(offer: Pick<RestaurantOffer, "maximumChildAge">): string | null {
  if (!offer.maximumChildAge) return null;
  return `Kids ${offer.maximumChildAge} & under`;
}

export function looksLikeFreeKidsMeal(summary: string): boolean {
  if (/buy one,\s*get one|bogo/i.test(summary)) return false;
  return /eat free|free kids|free ice cream|free brunch|free kids'|quesadilla/i.test(
    summary,
  );
}

export function formatSourceMonth(lastChecked?: string): string | null {
  if (!lastChecked) return null;
  const match = lastChecked.match(/^(\d{4})-(\d{2})/);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
