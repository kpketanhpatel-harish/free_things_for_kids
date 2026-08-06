"use client";

import type { Activity } from "@/types";
import {
  generateActivityIcs,
  getActivityIcsFilename,
} from "@/lib/generateActivityIcs";

type AddToCalendarButtonProps = {
  activity: Activity;
  size?: "sm" | "md";
};

export default function AddToCalendarButton({
  activity,
  size = "md",
}: AddToCalendarButtonProps) {
  function handleDownload() {
    const icsContent = generateActivityIcs(activity);
    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = getActivityIcsFilename(activity);
    link.click();

    URL.revokeObjectURL(url);
  }

  const sizeClasses =
    size === "sm"
      ? "px-3 py-1.5 text-xs"
      : "px-4 py-2 text-sm";

  return (
    <button
      type="button"
      onClick={handleDownload}
      className={`inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 font-medium text-blue-800 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${sizeClasses}`}
    >
      Add to calendar
    </button>
  );
}
