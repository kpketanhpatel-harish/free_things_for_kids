"use client";

import { useMemo, useState } from "react";
import KidsEatFreeMapLoader from "@/components/KidsEatFreeMapLoader";
import RestaurantOfferCard from "@/components/RestaurantOfferCard";
import EmptyState from "@/components/EmptyState";
import { addDaysYmd, chicagoTodayYmd } from "@/lib/chicagoTime";
import {
  formatOfferWhen,
  groupUpcomingOffers,
  offersForShortcut,
  type DateShortcut,
} from "@/lib/restaurantOfferSchedule";
import type { DayOfWeek, RestaurantOffer } from "@/types";

type RestaurantOfferListProps = {
  offers: RestaurantOffer[];
};

const dayOrder: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SHORTCUTS: { value: DateShortcut; label: string }[] = [
  { value: "tonight", label: "Tonight" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "weekend", label: "This Weekend" },
  { value: "all", label: "All" },
];

export default function RestaurantOfferList({
  offers,
}: RestaurantOfferListProps) {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("All");
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | "All">("All");
  const [confirmedOnly, setConfirmedOnly] = useState(false);
  const [shortcut, setShortcut] = useState<DateShortcut>("tonight");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const neighborhoods = Array.from(
    new Set(offers.map((offer) => offer.neighborhood)),
  ).sort();

  const eligibleDays = Array.from(
    new Set(offers.flatMap((offer) => offer.eligibleDays)),
  ).sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

  const userFiltered =
    selectedNeighborhood !== "All" ||
    selectedDay !== "All" ||
    confirmedOnly;

  const filtered = useMemo(() => {
    return offers.filter((offer) => {
      const matchesNeighborhood =
        selectedNeighborhood === "All" ||
        offer.neighborhood === selectedNeighborhood;
      const matchesDay =
        selectedDay === "All" || offer.eligibleDays.includes(selectedDay);
      const matchesConfirmation = !confirmedOnly || offer.confirmed;
      return matchesNeighborhood && matchesDay && matchesConfirmation;
    });
  }, [offers, selectedNeighborhood, selectedDay, confirmedOnly]);

  const shortcutOffers = useMemo(
    () => offersForShortcut(filtered, shortcut),
    [filtered, shortcut],
  );

  const useUpcomingFallback =
    shortcut === "tonight" && !userFiltered && shortcutOffers.length === 0;

  const upcomingGroups = useMemo(() => {
    if (!useUpcomingFallback) return [];
    const today = chicagoTodayYmd();
    return groupUpcomingOffers(filtered, {
      startFromYmd: addDaysYmd(today, 1),
      maxDays: 4,
      maxOffers: 10,
    });
  }, [filtered, useUpcomingFallback]);

  const displayedOffers = useUpcomingFallback
    ? upcomingGroups.flatMap((group) => group.offers)
    : shortcutOffers;

  function clearFilters() {
    setSelectedNeighborhood("All");
    setSelectedDay("All");
    setConfirmedOnly(false);
    setShortcut("tonight");
    setSelectedId(null);
  }

  function selectOffer(id: string) {
    setSelectedId(id);
    document.getElementById(`offer-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const filtersAtDefault =
    !userFiltered && shortcut === "tonight";

  const resultCount = displayedOffers.length;
  const resultLabel =
    resultCount === 1 ? "1 offer found" : `${resultCount} offers found`;

  const userEmpty = !useUpcomingFallback && displayedOffers.length === 0;

  return (
    <section>
      <div className="mb-5">
        <KidsEatFreeMapLoader
          offers={displayedOffers}
          selectedId={selectedId}
          onSelect={selectOffer}
        />
      </div>

      <div
        role="radiogroup"
        aria-label="When can kids eat free?"
        className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-orange-100 p-1 sm:grid-cols-4"
      >
        {SHORTCUTS.map((option) => {
          const selected = shortcut === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setShortcut(option.value);
                setSelectedDay("All");
                setSelectedId(null);
              }}
              className={
                selected
                  ? "min-h-11 rounded-xl bg-white text-sm font-semibold text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  : "min-h-11 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="offer-neighborhood"
              className="block text-sm font-medium text-gray-700"
            >
              Neighborhood
            </label>
            <select
              id="offer-neighborhood"
              value={selectedNeighborhood}
              onChange={(event) =>
                setSelectedNeighborhood(event.target.value)
              }
              className="mt-2 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="All">All neighborhoods</option>
              {neighborhoods.map((neighborhood) => (
                <option key={neighborhood} value={neighborhood}>
                  {neighborhood}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="offer-day"
              className="block text-sm font-medium text-gray-700"
            >
              Eligible day
            </label>
            <select
              id="offer-day"
              value={selectedDay}
              onChange={(event) => {
                setSelectedDay(event.target.value as DayOfWeek | "All");
                setShortcut("all");
              }}
              className="mt-2 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="All">All days</option>
              {eligibleDays.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="flex min-h-11 items-center gap-2">
              <input
                id="confirmed-only"
                type="checkbox"
                checked={confirmedOnly}
                onChange={(event) =>
                  setConfirmedOnly(event.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-orange-700 focus:ring-2 focus:ring-orange-200"
              />
              <label
                htmlFor="confirmed-only"
                className="text-sm font-medium text-gray-700"
              >
                Confirmed offers only
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm font-medium text-gray-700">{resultLabel}</p>
        <button
          type="button"
          onClick={clearFilters}
          disabled={filtersAtDefault}
          className="min-h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-200"
        >
          Clear filters
        </button>
      </div>

      {useUpcomingFallback ? (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Nothing tonight — here’s what’s coming up
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              No listed offers for tonight. Here are the next eligible days.
            </p>
          </div>
          {upcomingGroups.map((group) => (
            <div key={group.ymd}>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                {group.heading}
              </h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {group.offers.map((offer) => (
                  <RestaurantOfferCard
                    key={offer.id}
                    offer={offer}
                    whenLabel={formatOfferWhen(offer, new Date(), group.ymd)}
                    highlighted={selectedId === offer.id}
                    onSelect={() => setSelectedId(offer.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : userEmpty ? (
        <EmptyState
          title="No offers match those filters."
          description="Try another neighborhood or day, or clear filters to see what’s coming up."
          actions={[
            { label: "Clear filters", onClick: clearFilters },
            {
              label: "View upcoming offers",
              onClick: () => {
                setSelectedNeighborhood("All");
                setSelectedDay("All");
                setConfirmedOnly(false);
                setShortcut("all");
              },
            },
            { label: "See today's activities", href: "/" },
          ]}
        />
      ) : (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            {shortcut === "tonight"
              ? "Tonight"
              : shortcut === "tomorrow"
                ? "Tomorrow"
                : shortcut === "weekend"
                  ? "This weekend"
                  : "All offers"}
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {displayedOffers.map((offer) => (
              <RestaurantOfferCard
                key={offer.id}
                offer={offer}
                highlighted={selectedId === offer.id}
                onSelect={() => setSelectedId(offer.id)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
