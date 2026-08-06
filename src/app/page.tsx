import Link from "next/link";
import ActivityCard from "@/components/ActivityCard";
import RestaurantOfferCard from "@/components/RestaurantOfferCard";
import SearchBar from "@/components/SearchBar";
import { activities } from "@/data/activities";
import { restaurantOffers } from "@/data/restaurantOffers";
import {
  getUpcomingActivities,
  getUpcomingRestaurantOffers,
} from "@/lib/upcoming";

export default function HomePage() {
  const upcomingActivities = getUpcomingActivities(activities, 3);
  const upcomingOffers = getUpcomingRestaurantOffers(restaurantOffers, 3);

  return (
    <main className="bg-sky-50">
      <section className="mx-auto flex max-w-6xl flex-col px-4 py-10">
        <header className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Free Kids Things - Chicago Edition
            </h1>

            <Link
              href="/login"
              className="shrink-0 rounded-xl border border-gray-300 bg-white px-4 py-2 font-medium text-gray-900 shadow-sm transition hover:bg-gray-50"
            >
              Login
            </Link>
          </div>

          <SearchBar />
        </header>

        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Upcoming Activities
            </h2>

            <Link
              href="/activities"
              className="shrink-0 rounded-xl bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800"
            >
              View all activities
            </Link>
          </div>

          {upcomingActivities.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  variant="upcoming"
                />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-white p-6 text-gray-600 shadow-sm">
              No activities scheduled for today or tomorrow.
            </p>
          )}
        </section>

        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Kids Eat Free Today &amp; Tomorrow
            </h2>

            <Link
              href="/kids-eat-free"
              className="shrink-0 rounded-xl bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-orange-700"
            >
              View all offers
            </Link>
          </div>

          {upcomingOffers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingOffers.map((offer) => (
                <RestaurantOfferCard
                  key={offer.id}
                  offer={offer}
                  variant="upcoming"
                />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-white p-6 text-gray-600 shadow-sm">
              No kids-eat-free offers for today or tomorrow.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}
