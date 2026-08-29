"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Activity } from "@/types";
import { trackEvent } from "@/lib/analytics";
import {
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
  canGenerateActivityIcs,
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
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (!canGenerateActivityIcs(activity)) {
    return null;
  }

  function closeChooser() {
    setOpen(false);
  }

  function openExternalCalendar(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
    closeChooser();
  }

  function handleDownloadIcs() {
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
    closeChooser();
  }

  const sizeClasses =
    size === "sm"
      ? "min-h-11 px-3 text-sm"
      : "min-h-11 px-4 text-sm";

  const optionClasses =
    "flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-900 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

  return (
    <>
      <button
        type="button"
        onClick={() => {
          trackEvent("add_to_calendar_clicked", { activity_id: activity.id });
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 font-medium text-blue-800 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${sizeClasses}`}
      >
        Add to calendar
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="w-[min(100%,22rem)] rounded-2xl border border-gray-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40"
        onClose={closeChooser}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            closeChooser();
          }
        }}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id={titleId}
                className="text-lg font-semibold text-gray-900"
              >
                Add to calendar
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Choose where to save this activity.
              </p>
            </div>

            <button
              type="button"
              onClick={closeChooser}
              aria-label="Close"
              className="rounded-md px-2 py-1 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              className={optionClasses}
              onClick={() =>
                openExternalCalendar(buildGoogleCalendarUrl(activity))
              }
            >
              <span>Google Calendar</span>
              <span aria-hidden="true" className="text-gray-400">
                ↗
              </span>
            </button>

            <button
              type="button"
              className={optionClasses}
              onClick={() =>
                openExternalCalendar(buildOutlookCalendarUrl(activity))
              }
            >
              <span>Outlook</span>
              <span aria-hidden="true" className="text-gray-400">
                ↗
              </span>
            </button>

            <button
              type="button"
              className={optionClasses}
              onClick={handleDownloadIcs}
            >
              <span>Download .ics</span>
              <span className="text-xs font-normal text-gray-500">
                Apple / other
              </span>
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
