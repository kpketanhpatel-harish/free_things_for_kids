import Image from "next/image";
import Link from "next/link";
import ActivityCard from "@/components/ActivityCard";
import RestaurantOfferCard from "@/components/RestaurantOfferCard";
import SearchBar from "@/components/SearchBar";
import { getActivities } from "@/lib/activities";
import { getRestaurantOffers } from "@/lib/restaurantOffers";
import {
  getUpcomingActivities,
  getUpcomingRestaurantOffers,
} from "@/lib/upcoming";

// Redeploy trigger: ensure Vercel picks up Supabase env vars.
export default async function HomePage() {
  const [activities, restaurantOffers] = await Promise.all([
    getActivities(),
    getRestaurantOffers(),
  ]);
  const upcomingActivities = getUpcomingActivities(activities, 3);
  const upcomingOffers = getUpcomingRestaurantOffers(restaurantOffers, 3);

  return (
    <main className="bg-sky-50">
      <section className="relative min-h-[22rem] overflow-hidden md:min-h-[28rem]">
        <Image
          src="/images/chicago-skyline-hero.png"
          alt="Chicago skyline at dusk over Lake Michigan"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/65 to-slate-900/35"
        />

        <div className="relative mx-auto flex max-w-6xl flex-col justify-end px-4 py-12 md:min-h-[28rem] md:py-16">
          <header className="flex flex-col gap-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-sky-200">
                Chicago family guide
              </p>

              <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-white md:text-5xl">
                Free Kids Things — Chicago Edition
              </h1>

              <p className="mt-3 max-w-xl text-base text-slate-200 md:text-lg">
                Discover free activities and kids-eat-free offers in
                Lakeview, Roscoe Village, and Lincoln Park.
              </p>
            </div>

            <SearchBar />
          </header>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div>
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
        </div>

        <div className="mt-12">
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
        </div>
      </section>
    </main>
  );
}
