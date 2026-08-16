import Link from "next/link";
import type { Activity } from "@/types";
import { getActivityHref } from "@/lib/activityPath";
import {
  formatPillTime,
  getActivityEmoji,
  getCalendarEventType,
  shortenCalendarTitle,
  shortVenueLabel,
  type CalendarEventType,
} from "@/lib/calendarDisplay";

const TYPE_STYLES: Record<CalendarEventType, string> = {
  recurring:
    "border-sky-300 bg-sky-100 text-sky-950 hover:bg-sky-200",
  "one-off":
    "border-orange-300 bg-orange-100 text-orange-950 hover:bg-orange-200",
  "all-day":
    "border-emerald-300 bg-emerald-100 text-emerald-950 hover:bg-emerald-200",
};

const TYPE_LABEL: Record<CalendarEventType, string> = {
  recurring: "Recurring activity",
  "one-off": "One-off activity",
  "all-day": "All-day activity",
};

type CalendarEventPillProps = {
  activity: Activity;
  recurringTitles: Set<string>;
  compact?: boolean;
};

export default function CalendarEventPill({
  activity,
  recurringTitles,
  compact = false,
}: CalendarEventPillProps) {
  const type = getCalendarEventType(activity, recurringTitles);
  const title = shortenCalendarTitle(activity.title);
  const venue = shortVenueLabel(activity.venue);
  const time = formatPillTime(activity.startTime);
  const emoji = getActivityEmoji(activity);
  const label = `${TYPE_LABEL[type]}: ${activity.title} at ${activity.venue}, ${time}`;

  return (
    <Link
      href={getActivityHref(activity)}
      title={label}
      aria-label={label}
      className={`block rounded-xl border px-1.5 py-0.5 leading-tight transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${TYPE_STYLES[type]}`}
    >
      <span className="block truncate text-[11px] font-semibold md:text-xs">
        <span aria-hidden="true">{emoji} </span>
        {title}
      </span>
      {compact ? null : (
        <span className="block truncate text-[10px] font-normal opacity-80 md:text-[11px]">
          {venue} · {time}
        </span>
      )}
    </Link>
  );
}
