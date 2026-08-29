import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCalendarButton from "@/components/AddToCalendarButton";
import FreeBadge from "@/components/FreeBadge";
import VerificationBadge from "@/components/VerificationBadge";
import { getActivityById } from "@/lib/activities";
import { decodeActivityId, getActivityHref } from "@/lib/activityPath";
import { activityTags, compactAgeLabel } from "@/lib/activityFacets";
import { formatTimeRange } from "@/lib/chicagoTime";
import { formatActivityDate, formatListedDate } from "@/lib/formatActivityDate";
import { SITE_NAME } from "@/lib/site";
import { activityEventJsonLd } from "@/lib/structuredData";

type ActivityDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ActivityDetailPageProps): Promise<Metadata> {
  const { id: rawId } = await params;
  const activity = await getActivityById(decodeActivityId(rawId));
  if (!activity) {
    return { title: "Activity not found" };
  }

  const description = `${activity.title} on ${formatActivityDate(activity.date)} in ${activity.neighborhood}. Free for ${compactAgeLabel(activity.ageGroup)}.`;

  return {
    title: `${activity.title} in ${activity.neighborhood}`,
    description,
    alternates: { canonical: getActivityHref(activity) },
    openGraph: {
      title: `${activity.title} | ${SITE_NAME}`,
      description,
      type: "article",
    },
  };
}

export default async function ActivityDetailPage({
  params,
}: ActivityDetailPageProps) {
  const { id: rawId } = await params;
  const activity = await getActivityById(decodeActivityId(rawId));

  if (!activity) {
    notFound();
  }

  const listed = formatListedDate(activity.createdAt);
  const tags = activityTags(activity);

  return (
    <main className="bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(activityEventJsonLd(activity)),
        }}
      />
      <section className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <Link
          href="/"
          className="text-sm font-medium text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          ← Back to today
        </Link>

        <article className="mt-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
              {activity.neighborhood}
            </span>
            <FreeBadge />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">
            <span className="mr-2" aria-hidden="true">
              {activity.icon}
            </span>
            {activity.title}
          </h1>

          <p className="mt-3 text-gray-700">{activity.summary}</p>

          <dl className="mt-6 space-y-3 text-gray-800">
            <div>
              <dt className="text-sm font-semibold text-gray-500">Date</dt>
              <dd>{formatActivityDate(activity.date)}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-500">Start time</dt>
              <dd>{formatTimeRange(activity.startTime, activity.endTime)}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-500">Venue</dt>
              <dd>{activity.venue}</dd>
            </div>
            {activity.address ? (
              <div>
                <dt className="text-sm font-semibold text-gray-500">Address</dt>
                <dd>{activity.address}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-sm font-semibold text-gray-500">Neighborhood</dt>
              <dd>{activity.neighborhood}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-500">Age range</dt>
              <dd>{activity.ageGroup}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-500">Price</dt>
              <dd>Free</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-500">
                Registration
              </dt>
              <dd>
                {activity.registrationRequired ? "Required" : "Drop-in"}
              </dd>
            </div>
            {activity.sourceName ? (
              <div>
                <dt className="text-sm font-semibold text-gray-500">Source</dt>
                <dd>{activity.sourceName}</dd>
              </div>
            ) : (
              <div>
                <dt className="text-sm font-semibold text-gray-500">Source</dt>
                <dd>
                  {(() => {
                    try {
                      return new URL(activity.sourceUrl).hostname.replace(
                        /^www\./,
                        "",
                      );
                    } catch {
                      return "Event page";
                    }
                  })()}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {listed ? (
            <div className="mt-4">
              <VerificationBadge label={`Listed ${listed}`} />
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <AddToCalendarButton activity={activity} />
            <a
              href={activity.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              View original source
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}
