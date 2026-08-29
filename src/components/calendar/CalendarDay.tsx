"use client";

import { useEffect, useRef, useState } from "react";
import type { Activity } from "@/types";
import type { CalendarDayCell } from "@/lib/calendarDisplay";
import CalendarEventPill from "@/components/calendar/CalendarEventPill";

const DESKTOP_VISIBLE = 3;

type CalendarDayProps = {
  cell: CalendarDayCell;
  activities: Activity[];
  recurringTitles: Set<string>;
  isToday: boolean;
  isSelected: boolean;
  onSelect: (date: string) => void;
};

export default function CalendarDay({
  cell,
  activities,
  recurringTitles,
  isToday,
  isSelected,
  onSelect,
}: CalendarDayProps) {
  const [open, setOpen] = useState(false);
  const extraRef = useRef<HTMLDivElement>(null);
  const visible = activities.slice(0, DESKTOP_VISIBLE);
  const extra = activities.slice(DESKTOP_VISIBLE);
  const dayNumber = Number(cell.date.slice(8, 10));

  useEffect(() => {
    if (!open) return;

    function handlePointer(event: MouseEvent) {
      if (!extraRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, [open]);

  return (
    <div
      className={`relative flex min-h-[4.5rem] flex-col border border-gray-200 bg-white p-1 md:min-h-[8.5rem] md:p-1.5 ${
        cell.inMonth ? "" : "bg-gray-50"
      } ${isSelected ? "ring-2 ring-blue-500 ring-inset" : ""}`}
    >
      <button
        type="button"
        onClick={() => onSelect(cell.date)}
        className={`mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold md:text-sm ${
          isToday
            ? "bg-blue-700 text-white"
            : cell.inMonth
              ? "text-gray-800"
              : "text-gray-400"
        }`}
        aria-label={`Select ${cell.date}`}
        aria-current={isToday ? "date" : undefined}
        aria-pressed={isSelected}
      >
        {dayNumber}
      </button>

      <div className="hidden flex-1 flex-col gap-0.5 md:flex">
        {visible.map((activity) => (
          <CalendarEventPill
            key={activity.id}
            activity={activity}
            recurringTitles={recurringTitles}
          />
        ))}

        {extra.length > 0 ? (
          <div ref={extraRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="w-full px-1 text-left text-[11px] font-medium text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              +{extra.length} more
            </button>
            {open ? (
              <div className="absolute left-0 right-0 z-20 mt-0.5 flex max-h-48 flex-col gap-0.5 overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                {extra.map((activity) => (
                  <CalendarEventPill
                    key={activity.id}
                    activity={activity}
                    recurringTitles={recurringTitles}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <p className="mt-auto text-center text-[10px] text-gray-500 md:hidden">
        {activities.length > 0
          ? `${activities.length} event${activities.length === 1 ? "" : "s"}`
          : ""}
      </p>
    </div>
  );
}
