import ActivityCard from "@/components/ActivityCard";
import { activities } from "@/data/activities";

export default function ActivitiesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
