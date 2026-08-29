"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ActivityCard from "@/components/ActivityCard";
import DateIntentSelector from "@/components/DateIntentSelector";
import EmptyState from "@/components/EmptyState";
import FilterChips from "@/components/FilterChips";
import NewsletterCTA from "@/components/NewsletterCTA";
import RestaurantOfferCard from "@/components/RestaurantOfferCard";
import { TARGET_NEIGHBORHOODS } from "@/lib/site";
import { trackEvent } from "@/lib/analytics";
import {
  EMPTY_FILTERS,
  filtersAreActive,
  type DiscoveryFilters,
} from "@/lib/activityFacets";
import type { DateIntent } from "@/lib/chicagoTime";
import { chicagoTodayYmd, datesForIntent } from "@/lib/chicagoTime";
import { discoverActivities, offersForDates } from "@/lib/upcoming";
import type { Activity, RestaurantOffer } from "@/types";

type HomeExplorerProps = {
  activities: Activity[];
  offers: RestaurantOffer[];
};

const INTENT_EVENTS: Record<DateIntent, string> = {
  today: "today_selected",
  tomorrow: "tomorrow_selected",
  weekend: "weekend_selected",
};

const SECTION_TITLES: Record<DateIntent, string> = {
  today: "Happening today",
  tomorrow: "Happening tomorrow",
  weekend: "This weekend",
};

const EAT_TITLES: Record<DateIntent, string> = {
  today: "Kids Eat Free Tonight",
  tomorrow: "Kids Eat Free Tomorrow",
  weekend: "Kids Eat Free This Weekend",
};

export default function HomeExplorer({
  activities,
  offers,
}: HomeExplorerProps) {
  const [intent, setIntent] = useState<DateIntent>("today");
  const [filters, setFilters] = useState<DiscoveryFilters>(EMPTY_FILTERS);

  const neighborhoods = useMemo(() => {
    const fromData = new Set(activities.map((activity) => activity.neighborhood));
    return [
      ...TARGET_NEIGHBORHOODS.filter((name) => fromData.has(name)),
      ...[...fromData]
        .filter((name) => !(TARGET_NEIGHBORHOODS as readonly string[]).includes(name))
        .sort(),
    ];
  }, [activities]);

  const visibleActivities = useMemo(
    () => discoverActivities(activities, intent, filters),
    [activities, intent, filters],
  );

  const visibleOffers = useMemo(() => {
    const dates = datesForIntent(intent, chicagoTodayYmd());
    return offersForDates(offers, dates).slice(0, 4);
  }, [intent, offers]);

  const weekendPreview = useMemo(() => {
    if (intent === "weekend") return [];
    return discoverActivities(activities, "weekend", EMPTY_FILTERS).slice(
      0,
      4,
    );
  }, [activities, intent]);

  const filteredOut = filtersAreActive(filters) && visibleActivities.length === 0;

  function changeIntent(next: DateIntent) {
    setIntent(next);
    trackEvent(INTENT_EVENTS[next]);
  }

  function changeFilters(next: DiscoveryFilters) {
    setFilters(next);
    if (filtersAreActive(next)) {
      trackEvent("filter_used", {
        age: next.age,
        neighborhood: next.neighborhood,
        time: next.time,
        setting: next.setting,
        type: next.type,
      });
    }
  }

  return (
    <div className="space-y-8">
      <DateIntentSelector value={intent} onChange={changeIntent} />

      <FilterChips
        filters={filters}
        neighborhoods={neighborhoods}
        onChange={changeFilters}
      />

      <section aria-labelledby="activities-heading">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 id="activities-heading" className="text-lg font-semibold text-gray-900">
            {SECTION_TITLES[intent]}
          </h2>
          <p className="text-sm text-gray-500">
            {visibleActivities.length === 1
              ? "1 activity"
              : `${visibleActivities.length} activities`}
          </p>
        </div>

        {visibleActivities.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {visibleActivities.slice(0, 8).map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                variant="upcoming"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              filteredOut
                ? "Nothing matches those filters."
                : intent === "today"
                  ? "Nothing listed for today yet."
                  : intent === "tomorrow"
                    ? "Nothing listed for tomorrow yet."
                    : "Nothing listed for this weekend yet."
            }
            description="Try another day, or see kids-eat-free deals nearby."
            actions={[
              ...(intent !== "tomorrow"
                ? [{ label: "Tomorrow", onClick: () => changeIntent("tomorrow") }]
                : []),
              ...(intent !== "weekend"
                ? [
                    {
                      label: "This Weekend",
                      onClick: () => changeIntent("weekend"),
                    },
                  ]
                : []),
              { label: "Kids Eat Free Tonight", href: "/kids-eat-free" },
              { label: "Browse calendar", href: "/calendar" },
            ]}
          />
        )}
      </section>

      <section aria-labelledby="eat-free-heading">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 id="eat-free-heading" className="text-lg font-semibold text-gray-900">
            {EAT_TITLES[intent]}
          </h2>
          <Link
            href="/kids-eat-free"
            className="text-sm font-medium text-orange-800 underline-offset-2 hover:underline"
          >
            All offers
          </Link>
        </div>
        {visibleOffers.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {visibleOffers.map((offer) => (
              <RestaurantOfferCard
                key={offer.id}
                offer={offer}
                variant="upcoming"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No kids-eat-free offers for this day."
            actions={[{ label: "See all offers", href: "/kids-eat-free" }]}
          />
        )}
        <p className="mt-3 text-xs text-gray-500">
          Restaurant promotions can change. Confirm with the restaurant before you go.
        </p>
      </section>

      {weekendPreview.length > 0 ? (
        <section aria-labelledby="weekend-heading">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 id="weekend-heading" className="text-lg font-semibold text-gray-900">
              This weekend
            </h2>
            <button
              type="button"
              onClick={() => changeIntent("weekend")}
              className="text-sm font-medium text-blue-700 underline-offset-2 hover:underline"
            >
              See all
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {weekendPreview.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                variant="upcoming"
              />
            ))}
          </div>
        </section>
      ) : null}

      <NewsletterCTA />
    </div>
  );
}
