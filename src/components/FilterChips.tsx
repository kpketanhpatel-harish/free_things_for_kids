"use client";

import type { ReactNode } from "react";
import {
  AGE_FILTERS,
  SETTING_FILTERS,
  TIME_FILTERS,
  TYPE_FILTERS,
  filtersAreActive,
  type DiscoveryFilters,
} from "@/lib/activityFacets";

type FilterChipsProps = {
  filters: DiscoveryFilters;
  neighborhoods: string[];
  onChange: (next: DiscoveryFilters) => void;
};

function Chip({
  pressed,
  children,
  onClick,
}: {
  pressed: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={
        pressed
          ? "inline-flex min-h-11 shrink-0 items-center rounded-full bg-blue-700 px-3.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          : "inline-flex min-h-11 shrink-0 items-center rounded-full border border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      }
    >
      {children}
    </button>
  );
}

function ChipRow({
  legend,
  children,
}: {
  legend: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
        {legend}
      </legend>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </fieldset>
  );
}

export default function FilterChips({
  filters,
  neighborhoods,
  onChange,
}: FilterChipsProps) {
  const active = filtersAreActive(filters);

  return (
    <div className="space-y-3">
      <ChipRow legend="Age">
        {AGE_FILTERS.map((option) => (
          <Chip
            key={option.value}
            pressed={filters.age === option.value}
            onClick={() => onChange({ ...filters, age: option.value })}
          >
            {option.label}
          </Chip>
        ))}
      </ChipRow>

      <ChipRow legend="Neighborhood">
        <Chip
          pressed={filters.neighborhood === "all"}
          onClick={() => onChange({ ...filters, neighborhood: "all" })}
        >
          All areas
        </Chip>
        {neighborhoods.map((neighborhood) => (
          <Chip
            key={neighborhood}
            pressed={filters.neighborhood === neighborhood}
            onClick={() =>
              onChange({ ...filters, neighborhood })
            }
          >
            {neighborhood}
          </Chip>
        ))}
      </ChipRow>

      <ChipRow legend="Time, setting, and type">
        {TIME_FILTERS.filter((option) => option.value !== "all").map(
          (option) => (
            <Chip
              key={option.value}
              pressed={filters.time === option.value}
              onClick={() =>
                onChange({
                  ...filters,
                  time: filters.time === option.value ? "all" : option.value,
                })
              }
            >
              {option.label}
            </Chip>
          ),
        )}
        {SETTING_FILTERS.filter((option) => option.value !== "all").map(
          (option) => (
            <Chip
              key={option.value}
              pressed={filters.setting === option.value}
              onClick={() =>
                onChange({
                  ...filters,
                  setting:
                    filters.setting === option.value ? "all" : option.value,
                })
              }
            >
              {option.label}
            </Chip>
          ),
        )}
        {TYPE_FILTERS.filter((option) => option.value !== "all").map(
          (option) => (
            <Chip
              key={option.value}
              pressed={filters.type === option.value}
              onClick={() =>
                onChange({
                  ...filters,
                  type: filters.type === option.value ? "all" : option.value,
                })
              }
            >
              {option.label}
            </Chip>
          ),
        )}
      </ChipRow>

      {active ? (
        <button
          type="button"
          onClick={() =>
            onChange({
              age: "all",
              neighborhood: "all",
              time: "all",
              setting: "all",
              type: "all",
            })
          }
          className="text-sm font-medium text-blue-700 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
