import type { Metadata } from "next";
import RestaurantOfferList from "@/components/RestaurantOfferList";
import { getRestaurantOffers } from "@/lib/restaurantOffers";
import { SITE_AREA } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Kids Eat Free in Chicago",
  description: `Kids-eat-free restaurant offers in ${SITE_AREA}. Confirm hours and restrictions with the restaurant.`,
  alternates: { canonical: "/kids-eat-free" },
};

export default async function KidsEatFreePage() {
  const restaurantOffers = await getRestaurantOffers();

  return (
    <main className="bg-gray-50">
      <section className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Kids Eat Free Tonight
          </h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Free or discounted kids meals in {SITE_AREA}. Filter by day to
            see what&apos;s on tonight.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-gray-500">
            Restaurant promotions can change without notice. Please confirm an
            offer directly with the restaurant before visiting.
          </p>
        </div>

        <RestaurantOfferList offers={restaurantOffers} />
      </section>
    </main>
  );
}
