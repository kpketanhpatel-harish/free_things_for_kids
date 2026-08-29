import type { Metadata } from "next";
import ActivityCard from "@/components/ActivityCard";
import EmptyState from "@/components/EmptyState";
import RestaurantOfferCard from "@/components/RestaurantOfferCard";
import SearchBar from "@/components/SearchBar";
import { getUpcomingPublishedActivities } from "@/lib/activities";
import {
  matchesSearchQuery,
  searchHaystack,
} from "@/lib/activityFacets";
import { getRestaurantOffers } from "@/lib/restaurantOffers";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Search",
  description: "Search free kids activities and kids-eat-free offers nearby.",
  alternates: { canonical: "/search" },
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const [activities, offers] = await Promise.all([
    getUpcomingPublishedActivities(),
    getRestaurantOffers(),
  ]);

  const matchedActivities = query
    ? activities.filter((activity) =>
        matchesSearchQuery(searchHaystack(activity), query),
      )
    : [];
  const matchedOffers = query
    ? offers.filter((offer) =>
        matchesSearchQuery(
          [
            offer.restaurantName,
            offer.neighborhood,
            offer.offerSummary,
            offer.eligibleDays.join(" "),
          ].join(" "),
          query,
        ),
      )
    : [];

  const empty = query.length > 0 && matchedActivities.length === 0 && matchedOffers.length === 0;

  return (
    <main className="bg-sky-50">
      <section className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <h1 className="text-3xl font-bold text-gray-900">Search</h1>
        <p className="mt-2 text-gray-600">
          Find a specific activity, venue, or restaurant. For “what’s free today,”
          start on Today instead.
        </p>
        <div className="mt-5">
          <SearchBar initialQuery={query} />
        </div>

        {!query ? (
          <p className="mt-8 text-sm text-gray-600">
            Try “story time”, “farmers market”, or a neighborhood name.
          </p>
        ) : empty ? (
          <div className="mt-8">
            <EmptyState
              title={`No matches for “${query}”.`}
              description="Try a shorter word, or browse by day."
              actions={[
                { label: "Today", href: "/" },
                { label: "This Weekend", href: "/" },
                { label: "Kids Eat Free Tonight", href: "/kids-eat-free" },
                { label: "Calendar", href: "/calendar" },
              ]}
            />
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {matchedActivities.length > 0 ? (
              <section>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  Activities
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {matchedActivities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      variant="upcoming"
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {matchedOffers.length > 0 ? (
              <section>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  Kids Eat Free
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {matchedOffers.map((offer) => (
                    <RestaurantOfferCard
                      key={offer.id}
                      offer={offer}
                      variant="upcoming"
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}
