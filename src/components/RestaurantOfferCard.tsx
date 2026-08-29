"use client";

import Link from "next/link";
import FreeBadge from "@/components/FreeBadge";
import VerificationBadge from "@/components/VerificationBadge";
import { trackEvent } from "@/lib/analytics";
import { formatListedDate } from "@/lib/formatActivityDate";
import type { RestaurantOffer } from "@/types";

type RestaurantOfferCardProps = {
  offer: RestaurantOffer;
  variant?: "default" | "upcoming";
};

function ageLine(offer: RestaurantOffer): string {
  return offer.maximumChildAge
    ? `Kids ${offer.maximumChildAge} and under`
    : "Kids meal age varies";
}

export default function RestaurantOfferCard({
  offer,
  variant = "default",
}: RestaurantOfferCardProps) {
  const listed = formatListedDate(offer.createdAt);
  const verifyLabel = offer.confirmed
    ? listed
      ? `Confirmed · Listed ${listed}`
      : "Confirmed"
    : listed
      ? `Last checked ${listed}`
      : "Confirm with the restaurant";

  return (
    <article>
      <Link
        href={`/kids-eat-free/${offer.id}`}
        onClick={() =>
          trackEvent("kids_eat_free_clicked", {
            offer_id: offer.id,
            source: variant,
          })
        }
        className="block rounded-2xl border border-orange-100 bg-orange-50/60 p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold leading-snug text-gray-900">
            {offer.restaurantName}
          </h2>
          <FreeBadge />
        </div>

        <p className="mt-1.5 text-sm text-gray-700">{offer.offerSummary}</p>

        <dl className="mt-3 space-y-0.5 text-sm text-gray-700">
          <div>
            <dt className="sr-only">Neighborhood</dt>
            <dd>{offer.neighborhood}</dd>
          </div>
          <div>
            <dt className="sr-only">Offer time</dt>
            <dd>{offer.eligibleHours}</dd>
          </div>
          <div>
            <dt className="sr-only">Eligible days</dt>
            <dd>{offer.eligibleDays.join(", ")}</dd>
          </div>
          <div>
            <dt className="sr-only">Maximum child age</dt>
            <dd>{ageLine(offer)}</dd>
          </div>
          <div>
            <dt className="sr-only">Adult purchase</dt>
            <dd>
              {offer.adultPurchaseRequired
                ? "Adult purchase required"
                : "No adult purchase required"}
            </dd>
          </div>
        </dl>

        <div className="mt-3">
          <VerificationBadge label={verifyLabel} />
        </div>
      </Link>
    </article>
  );
}
