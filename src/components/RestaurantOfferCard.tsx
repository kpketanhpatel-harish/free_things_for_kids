"use client";

import Link from "next/link";
import FreeBadge from "@/components/FreeBadge";
import VerificationBadge from "@/components/VerificationBadge";
import { trackEvent } from "@/lib/analytics";
import { restaurantDirectionsUrl } from "@/lib/restaurantOfferDirections";
import { getRestaurantOfferHref } from "@/lib/restaurantOfferPath";
import {
  ageHeadline,
  formatOfferWhen,
  formatSourceMonth,
  looksLikeFreeKidsMeal,
} from "@/lib/restaurantOfferSchedule";
import type { RestaurantOffer } from "@/types";

type RestaurantOfferCardProps = {
  offer: RestaurantOffer;
  variant?: "default" | "upcoming";
  whenLabel?: string;
  highlighted?: boolean;
  onSelect?: () => void;
};

function trustLabel(offer: RestaurantOffer): string {
  const sourced = formatSourceMonth(offer.lastChecked);
  if (offer.confirmed) {
    return sourced ? `Confirmed · ${sourced}` : "Confirmed";
  }
  if (sourced) return `Sourced ${sourced}`;
  return "Confirm with the restaurant";
}

export default function RestaurantOfferCard({
  offer,
  variant = "default",
  whenLabel,
  highlighted = false,
  onSelect,
}: RestaurantOfferCardProps) {
  const when = whenLabel ?? formatOfferWhen(offer);
  const age = ageHeadline(offer);
  const directions = restaurantDirectionsUrl(offer);
  const showFree = looksLikeFreeKidsMeal(offer.offerSummary);

  return (
    <article
      id={`offer-${offer.id}`}
      className={
        highlighted
          ? "scroll-mt-24 rounded-2xl border border-orange-400 bg-orange-50/80 p-4 shadow-sm ring-2 ring-orange-400"
          : "scroll-mt-24 rounded-2xl border border-orange-100 bg-orange-50/60 p-4 shadow-sm"
      }
    >
      <Link
        href={getRestaurantOfferHref(offer)}
        onClick={() => {
          onSelect?.();
          trackEvent("kids_eat_free_clicked", {
            offer_id: offer.id,
            source: variant,
          });
        }}
        className="block focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold leading-snug text-gray-900">
            {offer.restaurantName}
          </h2>
          {showFree ? <FreeBadge /> : null}
        </div>
        <p className="mt-1 text-sm text-gray-700">{offer.neighborhood}</p>
        <p className="mt-2 text-sm font-semibold text-gray-900">{when}</p>
        <p className="mt-1 text-sm font-medium text-gray-900">
          {offer.offerSummary}
        </p>
        {age ? (
          <p className="mt-1 text-sm text-gray-700">{age}</p>
        ) : null}
        <p className="mt-1 text-sm text-gray-700">
          {offer.adultPurchaseRequired
            ? "With adult entrée purchase"
            : "No adult purchase required"}
        </p>
        <div className="mt-2">
          <VerificationBadge label={trustLabel(offer)} />
        </div>
      </Link>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={getRestaurantOfferHref(offer)}
          className="inline-flex min-h-11 items-center rounded-full border border-orange-200 bg-white px-3.5 text-sm font-medium text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          Details
        </Link>
        {directions ? (
          <a
            href={directions}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              trackEvent("kids_eat_free_directions", { offer_id: offer.id })
            }
            className="inline-flex min-h-11 items-center rounded-full border border-orange-200 bg-white px-3.5 text-sm font-medium text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Directions
          </a>
        ) : null}
        {offer.website ? (
          <a
            href={offer.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-full border border-orange-200 bg-white px-3.5 text-sm font-medium text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Website
          </a>
        ) : null}
      </div>
    </article>
  );
}
