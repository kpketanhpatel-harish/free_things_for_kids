"use client";

import { useMemo, useState } from "react";
import ActivityCard from "@/components/ActivityCard";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import {
  matchesSearchQuery,
  searchHaystack,
} from "@/lib/activityFacets";
import type { Activity } from "@/types";

type ActivityListProps = {
  activities: Activity[];
  initialQuery?: string;
};

export default function ActivityList({
  activities,
  initialQuery = "",
}: ActivityListProps) {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("All");
  const [selectedRegistration, setSelectedRegistration] = useState("All");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("All");

  const neighborhoods = Array.from(
    new Set(activities.map((activity) => activity.neighborhood)),
  ).sort();

  const ageGroups = Array.from(
    new Set(activities.map((activity) => activity.ageGroup)),
  ).sort();

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesNeighborhood =
        selectedNeighborhood === "All" ||
        activity.neighborhood === selectedNeighborhood;
      const matchesAgeGroup =
        selectedAgeGroup === "All" || activity.ageGroup === selectedAgeGroup;
      const matchesRegistration =
        selectedRegistration === "All" ||
        (selectedRegistration === "Required" &&
          activity.registrationRequired) ||
        (selectedRegistration === "NotRequired" &&
          !activity.registrationRequired);
      const matchesQuery =
        !initialQuery ||
        matchesSearchQuery(searchHaystack(activity), initialQuery);
      return (
        matchesNeighborhood &&
        matchesAgeGroup &&
        matchesRegistration &&
        matchesQuery
      );
    });
  }, [
    activities,
    initialQuery,
    selectedAgeGroup,
    selectedNeighborhood,
    selectedRegistration,
  ]);

  const filtersActive =
    selectedNeighborhood !== "All" ||
    selectedRegistration !== "All" ||
    selectedAgeGroup !== "All";

  function clearFilters() {
    setSelectedNeighborhood("All");
    setSelectedRegistration("All");
    setSelectedAgeGroup("All");
  }

  const resultCount = filteredActivities.length;
  const resultLabel =
    resultCount === 1 ? "1 activity found" : `${resultCount} activities found`;

  const selectClass =
    "mt-2 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

  return (
    <section>
      <div className="mb-6">
        <SearchBar action="/activities" initialQuery={initialQuery} />
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="activity-neighborhood"
              className="block text-sm font-medium text-gray-700"
            >
              Neighborhood
            </label>
            <select
              id="activity-neighborhood"
              value={selectedNeighborhood}
              onChange={(event) =>
                setSelectedNeighborhood(event.target.value)
              }
              className={selectClass}
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
              htmlFor="activity-registration"
              className="block text-sm font-medium text-gray-700"
            >
              Registration
            </label>
            <select
              id="activity-registration"
              value={selectedRegistration}
              onChange={(event) =>
                setSelectedRegistration(event.target.value)
              }
              className={selectClass}
            >
              <option value="All">Drop-in or registration</option>
              <option value="Required">Registration required</option>
              <option value="NotRequired">Drop-in</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="activity-age-group"
              className="block text-sm font-medium text-gray-700"
            >
              Age group
            </label>
            <select
              id="activity-age-group"
              value={selectedAgeGroup}
              onChange={(event) => setSelectedAgeGroup(event.target.value)}
              className={selectClass}
            >
              <option value="All">All age groups</option>
              {ageGroups.map((ageGroup) => (
                <option key={ageGroup} value={ageGroup}>
                  {ageGroup}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm font-medium text-gray-700">{resultLabel}</p>
        <button
          type="button"
          onClick={clearFilters}
          disabled={!filtersActive}
          className="min-h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          Clear filters
        </button>
      </div>

      {filteredActivities.length === 0 ? (
        <EmptyState
          title="No activities match those filters."
          actions={[
            { label: "Clear filters", onClick: clearFilters },
            { label: "Today", href: "/" },
            { label: "Kids Eat Free Tonight", href: "/kids-eat-free" },
          ]}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              variant="upcoming"
            />
          ))}
        </div>
      )}
    </section>
  );
}
