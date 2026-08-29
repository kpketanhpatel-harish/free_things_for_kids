"use client";

import Link from "next/link";
import FreeBadge from "@/components/FreeBadge";
import { trackEvent } from "@/lib/analytics";
import { getActivityHref } from "@/lib/activityPath";
import { activityTags, compactAgeLabel } from "@/lib/activityFacets";
import { getActivityEmoji } from "@/lib/calendarDisplay";
import { formatActivityDate } from "@/lib/formatActivityDate";
import { formatTimeRange } from "@/lib/chicagoTime";
import type { Activity } from "@/types";

type ActivityCardProps = {
  activity: Activity;
  variant?: "default" | "upcoming" | "compact";
};

function venueLine(activity: Activity): string | null {
  if (!activity.venue || activity.venue === "See event page") return null;
  return activity.venue;
}

export default function ActivityCard({
  activity,
  variant = "default",
}: ActivityCardProps) {
  const href = getActivityHref(activity);
  const emoji = getActivityEmoji(activity);
  const tags = activityTags(activity);
  const when = `${formatActivityDate(activity.date)} · ${formatTimeRange(activity.startTime, activity.endTime)}`;

  if (variant === "compact") {
    return (
      <li className="w-full">
        <Link
          href={href}
          onClick={() =>
            trackEvent("activity_card_clicked", {
              activity_id: activity.id,
              source: "compact",
            })
          }
          className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-sky-100 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span aria-hidden="true">{emoji}</span>
          <span className="min-w-0 truncate">{activity.title}</span>
        </Link>
      </li>
    );
  }

  return (
    <article>
      <Link
        href={href}
        onClick={() =>
          trackEvent("activity_card_clicked", {
            activity_id: activity.id,
            source: variant,
          })
        }
        className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold leading-snug text-gray-900">
            <span aria-hidden="true" className="mr-1.5">
              {emoji}
            </span>
            {activity.title}
          </h2>
          <FreeBadge />
        </div>

        <p className="mt-1.5 text-sm text-gray-700">{when}</p>
        <p className="text-sm text-gray-600">
          {activity.neighborhood}
          {venueLine(activity) ? ` · ${venueLine(activity)}` : ""}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          {compactAgeLabel(activity.ageGroup)}
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </article>
  );
}
