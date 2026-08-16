import type { CalendarEventType } from "@/lib/calendarDisplay";

const LEGEND: { type: CalendarEventType; label: string; className: string }[] = [
  {
    type: "recurring",
    label: "Recurring",
    className: "bg-sky-500",
  },
  {
    type: "one-off",
    label: "One-off",
    className: "bg-orange-500",
  },
  {
    type: "all-day",
    label: "All-day",
    className: "bg-emerald-500",
  },
];

export default function CalendarLegend() {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-700">
        {LEGEND.map((item) => (
          <li key={item.type} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${item.className}`}
            />
            {item.label}
          </li>
        ))}
      </ul>

      <p className="text-sm text-gray-500">
        Click an activity to view details or add it to your calendar.
      </p>
    </div>
  );
}
