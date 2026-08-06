"use client";

import { useState } from "react";
import ActivityCard from "@/components/ActivityCard";
import type { Activity } from "@/types";

type ActivityListProps = {
  activities: Activity[];
};

export default function ActivityList({ activities }: ActivityListProps) {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("All");
  const [selectedRegistration, setSelectedRegistration] = useState("All");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("All");

  const neighborhoods = Array.from(
    new Set(activities.map((activity) => activity.neighborhood)),
  ).sort();

  const ageGroups = Array.from(
    new Set(activities.map((activity) => activity.ageGroup)),
  ).sort();

  const filteredActivities = activities.filter((activity) => {
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

    return matchesNeighborhood && matchesAgeGroup && matchesRegistration;
  });

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

  return (
    <section>
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
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
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
              Registration status
            </label>
            <select
              id="activity-registration"
              value={selectedRegistration}
              onChange={(event) =>
                setSelectedRegistration(event.target.value)
              }
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="All">All registration options</option>
              <option value="Required">Registration required</option>
              <option value="NotRequired">No registration required</option>
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
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm font-medium text-gray-700">{resultLabel}</p>

        <button
          type="button"
          onClick={clearFilters}
          disabled={!filtersActive}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear filters
        </button>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">
            No activities match your selected filters.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </section>
  );
}
