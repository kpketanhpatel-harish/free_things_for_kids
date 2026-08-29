import type { MetadataRoute } from "next";
import { getUpcomingPublishedActivities } from "@/lib/activities";
import { getActivityHref } from "@/lib/activityPath";
import { getRestaurantOffers } from "@/lib/restaurantOffers";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/activities",
    "/calendar",
    "/kids-eat-free",
    "/search",
    "/about",
    "/construction-sites",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === "" ? "hourly" : "daily",
    priority: path === "" ? 1 : 0.7,
  }));

  let activityRoutes: MetadataRoute.Sitemap = [];
  let offerRoutes: MetadataRoute.Sitemap = [];

  try {
    const [activities, offers] = await Promise.all([
      getUpcomingPublishedActivities(),
      getRestaurantOffers(),
    ]);
    activityRoutes = activities.slice(0, 500).map((activity) => ({
      url: `${SITE_URL}${getActivityHref(activity)}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));
    offerRoutes = offers.map((offer) => ({
      url: `${SITE_URL}/kids-eat-free/${offer.id}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  } catch (error) {
    console.error("Sitemap data load failed:", error);
  }

  return [...staticRoutes, ...activityRoutes, ...offerRoutes];
}
