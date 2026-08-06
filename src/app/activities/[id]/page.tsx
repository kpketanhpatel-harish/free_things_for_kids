import Link from "next/link";
import { notFound } from "next/navigation";
import { activities } from "@/data/activities";
import { formatActivityDate } from "@/lib/formatActivityDate";

type ActivityDetailPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return activities.map((activity) => ({
    id: activity.id,
  }));
}

export default async function ActivityDetailPage({
  params,
}: ActivityDetailPageProps) {
  const { id } = await params;

  const activity = activities.find((item) => item.id === id);

  if (!activity) {
    notFound();
  }

  return (
    <main className="bg-gray-50">
      <section className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/activities"
          className="text-sm font-medium text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          ← Back to Activities
        </Link>

        <article className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <p className="font-medium text-blue-700">
            Free Things for Kids Chicago
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
              {activity.neighborhood}
            </span>

            <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
              Free
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            <span className="mr-2" aria-hidden="true">
              {activity.icon}
            </span>
            {activity.title}
          </h1>

          <p className="mt-3 text-lg text-gray-600">{activity.summary}</p>

          <dl className="mt-8 space-y-3 text-gray-700">
            <div>
              <dt className="font-semibold">Date</dt>
              <dd>{formatActivityDate(activity.date)}</dd>
            </div>

            <div>
              <dt className="font-semibold">Time</dt>
              <dd>
                {activity.startTime}
                {activity.endTime ? `–${activity.endTime}` : ""}
              </dd>
            </div>

            <div>
              <dt className="font-semibold">Venue</dt>
              <dd>{activity.venue}</dd>
            </div>

            <div>
              <dt className="font-semibold">Neighborhood</dt>
              <dd>{activity.neighborhood}</dd>
            </div>

            <div>
              <dt className="font-semibold">Age group</dt>
              <dd>{activity.ageGroup}</dd>
            </div>

            <div>
              <dt className="font-semibold">Registration</dt>
              <dd>
                {activity.registrationRequired ? "Required" : "Not required"}
              </dd>
            </div>
          </dl>

          <div className="mt-8">
            <a
              href={activity.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-lg bg-blue-700 px-4 py-2 font-medium text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              View Original Source
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}
