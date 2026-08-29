import type { Activity } from "@/types";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import { getActivityHref } from "@/lib/activityPath";
import { parseTimeToMinutes } from "@/lib/chicagoTime";

function isoDateTime(date: string, time?: string): string {
  const minutes = parseTimeToMinutes(time);
  if (minutes == null) return date;
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");
  return `${date}T${hours}:${mins}:00`;
}

export function activityEventJsonLd(activity: Activity): Record<string, unknown> {
  const start = isoDateTime(activity.date, activity.startTime);
  const end = activity.endTime
    ? isoDateTime(activity.date, activity.endTime)
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: activity.title,
    description: activity.summary,
    startDate: start,
    ...(end ? { endDate: end } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    isAccessibleForFree: true,
    url: absoluteUrl(getActivityHref(activity)),
    image: `${SITE_URL}/images/roscoe-village-bridge.png`,
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    location: {
      "@type": "Place",
      name: activity.venue,
      address: {
        "@type": "PostalAddress",
        streetAddress: activity.address,
        addressLocality: activity.neighborhood,
        addressRegion: "IL",
        addressCountry: "US",
      },
    },
    typicalAgeRange: activity.ageGroup,
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
