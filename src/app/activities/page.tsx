import ActivityList from "@/components/ActivityList";
import { getActivities } from "@/lib/activities";

export default async function ActivitiesPage() {
  const activities = await getActivities();

  return (
    <main className="bg-gray-50">
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <p className="font-medium text-blue-700">
            Free Things for Kids Chicago
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            Free Activities For Kids
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            Discover free family activities in Lakeview, Roscoe Village,
            and Lincoln Park.
          </p>
        </div>

        <ActivityList activities={activities} />
      </section>
    </main>
  );
}
