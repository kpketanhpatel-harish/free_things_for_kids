"use client";

import type { DateIntent } from "@/lib/chicagoTime";

const OPTIONS: { value: DateIntent; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "weekend", label: "This Weekend" },
];

type DateIntentSelectorProps = {
  value: DateIntent;
  onChange: (value: DateIntent) => void;
};

export default function DateIntentSelector({
  value,
  onChange,
}: DateIntentSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="When do you want to go?"
      className="grid grid-cols-3 gap-1 rounded-2xl bg-sky-100 p-1"
    >
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={
              selected
                ? "min-h-11 rounded-xl bg-white text-sm font-semibold text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                : "min-h-11 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
