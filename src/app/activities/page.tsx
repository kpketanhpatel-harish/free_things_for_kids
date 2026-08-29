import type { Metadata } from "next";
import ActivityList from "@/components/ActivityList";
import { getUpcomingPublishedActivities } from "@/lib/activities";
import { SITE_AREA } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Free kids activities",
  description: `Upcoming free kids activities in ${SITE_AREA}.`,
  alternates: { canonical: "/activities" },
};

type ActivitiesPageProps = {
  searchParams: Promise<{ search?: string; q?: string }>;
};

export default async function ActivitiesPage({
  searchParams,
}: ActivitiesPageProps) {
  const params = await searchParams;
  const query = (params.q ?? params.search ?? "").trim();
  const activities = await getUpcomingPublishedActivities();

  return (
    <main className="bg-gray-50">
      <section className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Free kids activities
          </h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Upcoming free things to do with kids in {SITE_AREA}.
          </p>
        </div>

        <ActivityList activities={activities} initialQuery={query} />
      </section>
    </main>
  );
}
