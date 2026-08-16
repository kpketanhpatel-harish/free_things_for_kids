"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Activity } from "@/types";
import { formatActivityDate } from "@/lib/formatActivityDate";
import {
  buildCalendarDays,
  chicagoYearMonth,
  formatYearMonth,
  groupActivitiesByDate,
  monthTitle,
  recurringTitleSet,
  shiftMonth,
  weekdayLabels,
} from "@/lib/calendarDisplay";
import CalendarDay from "@/components/calendar/CalendarDay";
import CalendarEventPill from "@/components/calendar/CalendarEventPill";
import CalendarLegend from "@/components/calendar/CalendarLegend";

type MonthCalendarProps = {
  year: number;
  month: number;
  activities: Activity[];
};

export default function MonthCalendar({
  year,
  month,
  activities,
}: MonthCalendarProps) {
  const router = useRouter();
  const today = useMemo(() => {
    const { year: y, month: m } = chicagoYearMonth();
    const day = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    return { year: y, month: m, date: day };
  }, []);

  const [selectedDate, setSelectedDate] = useState(() => {
    if (today.year === year && today.month === month) return today.date;
    return `${formatYearMonth(year, month)}-01`;
  });

  useEffect(() => {
    if (today.year === year && today.month === month) {
      setSelectedDate(today.date);
      return;
    }
    setSelectedDate(`${formatYearMonth(year, month)}-01`);
  }, [year, month, today.date, today.month, today.year]);

  const days = useMemo(() => buildCalendarDays(year, month), [year, month]);
  const grouped = useMemo(
    () => groupActivitiesByDate(activities),
    [activities],
  );
  const recurringTitles = useMemo(
    () => recurringTitleSet(activities),
    [activities],
  );
  const selectedActivities = grouped.get(selectedDate) ?? [];

  function goToMonth(nextYear: number, nextMonth: number) {
    router.replace(`/calendar?month=${formatYearMonth(nextYear, nextMonth)}`);
  }

  function goToday() {
    setSelectedDate(today.date);
    if (today.year !== year || today.month !== month) {
      goToMonth(today.year, today.month);
    }
  }

  const previous = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  return (
    <div className="space-y-4">
      <CalendarLegend />

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goToMonth(previous.year, previous.month)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-lg text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Previous month"
        >
          ‹
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            {monthTitle(year, month)}
          </h1>
          <button
            type="button"
            onClick={goToday}
            className="mt-1 text-sm font-medium text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Today
          </button>
        </div>

        <button
          type="button"
          onClick={() => goToMonth(next.year, next.month)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-lg text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500 md:text-xs">
          {weekdayLabels().map((label) => (
            <div key={label} className="px-1 py-2">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((cell) => (
            <CalendarDay
              key={cell.date}
              cell={cell}
              activities={grouped.get(cell.date) ?? []}
              recurringTitles={recurringTitles}
              isToday={cell.date === today.date}
              isSelected={cell.date === selectedDate}
              onSelect={setSelectedDate}
            />
          ))}
        </div>
      </div>

      <section className="md:hidden">
        <h2 className="mb-2 text-sm font-semibold text-gray-900">
          {formatActivityDate(selectedDate)}
        </h2>
        {selectedActivities.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-4 text-sm text-gray-600">
            No free activities listed for this day.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {selectedActivities.map((activity) => (
              <li key={activity.id}>
                <CalendarEventPill
                  activity={activity}
                  recurringTitles={recurringTitles}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
