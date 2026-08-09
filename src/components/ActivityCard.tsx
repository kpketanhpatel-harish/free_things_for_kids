import Link from "next/link";
import AddToCalendarButton from "@/components/AddToCalendarButton";
import type { Activity } from "@/types";
import { formatActivityDate } from "@/lib/formatActivityDate";

type ActivityCardProps = {
  activity: Activity;
  variant?: "default" | "upcoming" | "compact";
};

function locationLabel(activity: Activity): string {
  if (
    activity.neighborhood &&
    activity.venue &&
    activity.venue !== "See event page"
  ) {
    return `${activity.venue} · ${activity.neighborhood}`;
  }
  return activity.venue || activity.neighborhood;
}

function ActivityDetails({
  activity,
  showRegistration = false,
}: {
  activity: Activity;
  showRegistration?: boolean;
}) {
  return (
    <dl className="space-y-1 text-sm text-gray-700">
      <div>
        <dt className="inline font-semibold">Date: </dt>
        <dd className="inline">{formatActivityDate(activity.date)}</dd>
      </div>

      <div>
        <dt className="inline font-semibold">Time: </dt>
        <dd className="inline">
          {activity.startTime
            ? `${activity.startTime}${activity.endTime ? `–${activity.endTime}` : ""}`
            : "Time TBA"}
        </dd>
      </div>

      <div>
        <dt className="inline font-semibold">Venue: </dt>
        <dd className="inline">{activity.venue}</dd>
      </div>

      {activity.address ? (
        <div>
          <dt className="inline font-semibold">Address: </dt>
          <dd className="inline">{activity.address}</dd>
        </div>
      ) : null}

      <div>
        <dt className="inline font-semibold">Age group: </dt>
        <dd className="inline">{activity.ageGroup}</dd>
      </div>

      {showRegistration && (
        <div>
          <dt className="inline font-semibold">Registration: </dt>
          <dd className="inline">
            {activity.registrationRequired ? "Required" : "Not required"}
          </dd>
        </div>
      )}
    </dl>
  );
}

export default function ActivityCard({
  activity,
  variant = "default",
}: ActivityCardProps) {
  if (variant === "compact") {
    return (
      <li>
        <Link
          href={`/activities/${activity.id}`}
          className="block rounded-lg border border-sky-100 bg-white px-3 py-2.5 shadow-sm transition hover:border-blue-300 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <p className="truncate text-sm font-semibold text-gray-900">
            {activity.title}
          </p>
          <p className="mt-0.5 truncate text-xs text-gray-600">
            {locationLabel(activity)}
          </p>
        </Link>
      </li>
    );
  }

  if (variant === "upcoming") {
    return (
      <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold leading-snug">
          <a
            href={activity.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-gray-900 hover:text-blue-700 hover:underline"
          >
            <span className="text-xl" aria-hidden="true">
              {activity.icon}
            </span>
            {activity.title}
          </a>
        </h2>

        <p className="mt-1.5 line-clamp-2 text-sm text-gray-600">
          {activity.summary}
        </p>

        <div className="mt-3">
          <ActivityDetails activity={activity} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-800">
            {activity.neighborhood}
          </span>

          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-green-800">
            Free
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href={`/activities/${activity.id}`}
            className="inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View Details
          </Link>

          <AddToCalendarButton activity={activity} size="sm" />
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">
          {activity.neighborhood}
        </span>

        <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">
          Free
        </span>
      </div>

      <h2 className="text-xl font-semibold text-gray-900">
        {activity.title}
      </h2>

      <p className="mt-2 text-gray-600">{activity.summary}</p>

      <div className="mt-4 space-y-2">
        <ActivityDetails activity={activity} showRegistration />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Link
          href={`/activities/${activity.id}`}
          className="inline-flex rounded-lg bg-blue-700 px-4 py-2 font-medium text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          View Details
        </Link>

        <AddToCalendarButton activity={activity} />

        <a
          href={activity.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          View original source
        </a>
      </div>
    </article>
  );
}
