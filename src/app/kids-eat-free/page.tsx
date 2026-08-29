import type { Metadata } from "next";
import RestaurantOfferList from "@/components/RestaurantOfferList";
import { getRestaurantOffers } from "@/lib/restaurantOffers";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Kids Eat Free in Chicago",
  description:
    "Kids eat free tonight in Chicago—family-friendly restaurant deals by neighborhood, including Lakeview, Lincoln Park, and Roscoe Village. Confirm hours and restrictions with the restaurant.",
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
            Family-friendly restaurant deals across Chicago, with kids-eat-free
            nights, early-dinner windows, and neighborhood happy hours. Start
            with tonight, or browse by neighborhood.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-gray-500">
            Restaurant promotions can change without notice. Please confirm an
            offer directly with the restaurant before visiting. Sourced listings
            are not independently confirmed unless marked confirmed.
          </p>
        </div>

        <RestaurantOfferList offers={restaurantOffers} />
      </section>
    </main>
  );
}
