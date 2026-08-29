import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FreeBadge from "@/components/FreeBadge";
import VerificationBadge from "@/components/VerificationBadge";
import { restaurantDirectionsUrl } from "@/lib/restaurantOfferDirections";
import {
  decodeRestaurantOfferId,
  getRestaurantOfferHref,
} from "@/lib/restaurantOfferPath";
import {
  ageHeadline,
  formatOfferWhen,
  formatSourceMonth,
  looksLikeFreeKidsMeal,
} from "@/lib/restaurantOfferSchedule";
import { getRestaurantOfferById } from "@/lib/restaurantOffers";
import { SITE_NAME } from "@/lib/site";

type RestaurantOfferDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: RestaurantOfferDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const offer = await getRestaurantOfferById(decodeRestaurantOfferId(id));
  if (!offer) return { title: "Offer not found" };

  const description = `${offer.restaurantName} in ${offer.neighborhood}: ${offer.offerSummary}`;
  return {
    title: `Kids eat free at ${offer.restaurantName}`,
    description,
    alternates: { canonical: getRestaurantOfferHref(offer) },
    openGraph: {
      title: `${offer.restaurantName} | ${SITE_NAME}`,
      description,
    },
  };
}

function trustLabel(confirmed: boolean, lastChecked?: string): string {
  const sourced = formatSourceMonth(lastChecked);
  if (confirmed) return sourced ? `Confirmed · ${sourced}` : "Confirmed";
  if (sourced) return `Sourced ${sourced} · not independently confirmed`;
  return "Unconfirmed — confirm with the restaurant";
}

export default async function RestaurantOfferDetailPage({
  params,
}: RestaurantOfferDetailPageProps) {
  const { id } = await params;
  const offer = await getRestaurantOfferById(decodeRestaurantOfferId(id));

  if (!offer) {
    notFound();
  }

  const directions = restaurantDirectionsUrl(offer);
  const age = ageHeadline(offer);

  return (
    <main className="bg-gray-50">
      <section className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <Link
          href="/kids-eat-free"
          className="text-sm font-medium text-orange-700 hover:underline focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          ← Back to Kids Eat Free
        </Link>

        <article className="mt-5 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm md:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-800">
              {offer.neighborhood}
            </span>
            {looksLikeFreeKidsMeal(offer.offerSummary) ? <FreeBadge /> : null}
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">
            {offer.restaurantName}
          </h1>
          <p className="mt-2 text-base font-semibold text-gray-900">
            {formatOfferWhen(offer)}
          </p>
          <p className="mt-3 text-gray-700">{offer.offerSummary}</p>
          <div className="mt-3">
            <VerificationBadge
              label={trustLabel(offer.confirmed, offer.lastChecked)}
            />
          </div>

          <dl className="mt-6 space-y-3 text-gray-800">
            {offer.address ? (
              <div>
                <dt className="text-sm font-semibold text-gray-500">Address</dt>
                <dd>{offer.address}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-sm font-semibold text-gray-500">Neighborhood</dt>
              <dd>{offer.neighborhood}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-500">Offer days</dt>
              <dd>{offer.eligibleDays.join(", ") || "See offer details"}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-500">Offer time</dt>
              <dd>{offer.eligibleHours}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-500">Kids age</dt>
              <dd>
                {age ??
                  (offer.maximumChildAge
                    ? `${offer.maximumChildAge} and under`
                    : "Not specified")}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-500">
                Adult purchase
              </dt>
              <dd>
                {offer.adultPurchaseRequired ? "Required" : "Not required"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-500">Restrictions</dt>
              <dd>
                {offer.notes
                  ? offer.notes
                  : offer.dineInOnly
                    ? "Dine-in only"
                    : "Dine-in or takeaway"}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            {directions ? (
              <a
                href={directions}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-full bg-orange-700 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Directions
              </a>
            ) : null}
            {offer.website ? (
              <a
                href={offer.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-full border border-orange-200 bg-white px-4 text-sm font-medium text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Restaurant website
              </a>
            ) : null}
          </div>

          {offer.sourceUrl ? (
            <p className="mt-6 text-sm text-gray-500">
              Source:{" "}
              <a
                href={offer.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-orange-800 underline-offset-2 hover:underline"
              >
                {offer.sourceName ?? "Original listing"}
              </a>
            </p>
          ) : null}

          <p className="mt-8 rounded-lg bg-orange-50 p-4 text-sm text-gray-700">
            Restaurant promotions can change without notice. Please confirm the
            offer directly with the restaurant before visiting.
          </p>
        </article>
      </section>
    </main>
  );
}
