import type { Metadata } from "next";
import HomeExplorer from "@/components/HomeExplorer";
import { getHomeDiscoveryActivities } from "@/lib/activities";
import { getRestaurantOffers } from "@/lib/restaurantOffers";
import {
  SITE_AREA,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} | ${SITE_TAGLINE}`,
  },
  description: `${SITE_DESCRIPTION} Covering ${SITE_AREA}.`,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [activities, restaurantOffers] = await Promise.all([
    getHomeDiscoveryActivities(),
    getRestaurantOffers(),
  ]);

  return (
    <main className="bg-sky-50">
      <section className="mx-auto max-w-6xl px-4 pt-5 pb-3 md:pt-8">
        <p className="text-sm font-medium text-blue-800">
          {SITE_NAME}
          <span className="font-normal text-gray-600"> · Chicago</span>
        </p>
        <h1 className="mt-1 max-w-2xl text-2xl font-bold tracking-tight text-gray-900 md:text-4xl">
          {SITE_TAGLINE}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-gray-600 md:text-base">
          {SITE_DESCRIPTION} {SITE_AREA}.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 md:pb-14">
        <HomeExplorer activities={activities} offers={restaurantOffers} />
      </section>
    </main>
  );
}
