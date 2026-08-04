import type { Activity } from "@/types";

type ActivityCardProps = {
  activity: Activity;
};

export default function ActivityCard({
  activity,
}: ActivityCardProps) {
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

      <dl className="mt-4 space-y-2 text-sm text-gray-700">
        <div>
          <dt className="inline font-semibold">Date: </dt>
          <dd className="inline">{activity.date}</dd>
        </div>

        <div>
          <dt className="inline font-semibold">Time: </dt>
          <dd className="inline">
            {activity.startTime}
            {activity.endTime ? `–${activity.endTime}` : ""}
          </dd>
        </div>

        <div>
          <dt className="inline font-semibold">Venue: </dt>
          <dd className="inline">{activity.venue}</dd>
        </div>

        <div>
          <dt className="inline font-semibold">Age group: </dt>
          <dd className="inline">{activity.ageGroup}</dd>
        </div>

        <div>
          <dt className="inline font-semibold">Registration: </dt>
          <dd className="inline">
            {activity.registrationRequired ? "Required" : "Not required"}
          </dd>
        </div>
      </dl>

      <a
        href={activity.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-block font-medium text-blue-700 hover:underline"
      >
        View original source
      </a>
    </article>
  );
}
