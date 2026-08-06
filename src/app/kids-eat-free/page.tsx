import RestaurantOfferList from "@/components/RestaurantOfferList";
import { restaurantOffers } from "@/data/restaurantOffers";

export default function KidsEatFreePage() {
  return (
    <main className="bg-gray-50">
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <p className="font-medium text-orange-700">
            Free Things for Kids Chicago
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            Kids Eat Free
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            Discover restaurant offers for children in Lakeview, Roscoe
            Village, and Lincoln Park.
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
