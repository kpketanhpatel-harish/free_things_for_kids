"use client";

import { useState } from "react";
import RestaurantOfferCard from "@/components/RestaurantOfferCard";
import EmptyState from "@/components/EmptyState";
import { chicagoWeekdayIndex, DAY_NAMES } from "@/lib/chicagoTime";
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

export default function RestaurantOfferList({
  offers,
}: RestaurantOfferListProps) {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("All");
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | "All">(
    DAY_NAMES[chicagoWeekdayIndex()],
  );
  const [confirmedOnly, setConfirmedOnly] = useState(true);

  const neighborhoods = Array.from(
    new Set(offers.map((offer) => offer.neighborhood)),
  ).sort();

  const eligibleDays = Array.from(
    new Set(offers.flatMap((offer) => offer.eligibleDays)),
  ).sort(
    (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b),
  );

  const filteredOffers = offers.filter((offer) => {
    const matchesNeighborhood =
      selectedNeighborhood === "All" ||
      offer.neighborhood === selectedNeighborhood;

    const matchesDay =
      selectedDay === "All" || offer.eligibleDays.includes(selectedDay);

    const matchesConfirmation = !confirmedOnly || offer.confirmed;

    return matchesNeighborhood && matchesDay && matchesConfirmation;
  });

  const filtersAtDefault =
    selectedNeighborhood === "All" &&
    selectedDay === DAY_NAMES[chicagoWeekdayIndex()] &&
    confirmedOnly === true;

  function clearFilters() {
    setSelectedNeighborhood("All");
    setSelectedDay(DAY_NAMES[chicagoWeekdayIndex()]);
    setConfirmedOnly(true);
  }

  const resultCount = filteredOffers.length;
  const resultLabel =
    resultCount === 1 ? "1 offer found" : `${resultCount} offers found`;

  return (
    <section>
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
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
              onChange={(event) =>
                setSelectedDay(event.target.value as DayOfWeek | "All")
              }
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
            <div className="flex items-center gap-2 pb-2">
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

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
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

      {filteredOffers.length === 0 ? (
        <EmptyState
          title="No restaurant offers match those filters."
          actions={[
            { label: "Clear filters", onClick: clearFilters },
            { label: "See today's activities", href: "/" },
          ]}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredOffers.map((offer) => (
            <RestaurantOfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </section>
  );
}
