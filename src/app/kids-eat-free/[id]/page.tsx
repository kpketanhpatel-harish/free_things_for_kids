import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FreeBadge from "@/components/FreeBadge";
import VerificationBadge from "@/components/VerificationBadge";
import { formatListedDate } from "@/lib/formatActivityDate";
import { getRestaurantOfferById } from "@/lib/restaurantOffers";
import { SITE_NAME } from "@/lib/site";

type RestaurantOfferDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: RestaurantOfferDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const offer = await getRestaurantOfferById(id);
  if (!offer) return { title: "Offer not found" };

  const description = `${offer.restaurantName} in ${offer.neighborhood}: ${offer.offerSummary}`;
  return {
    title: `Kids eat free at ${offer.restaurantName}`,
    description,
    alternates: { canonical: `/kids-eat-free/${offer.id}` },
    openGraph: {
      title: `${offer.restaurantName} | ${SITE_NAME}`,
      description,
    },
  };
}

export default async function RestaurantOfferDetailPage({
  params,
}: RestaurantOfferDetailPageProps) {
  const { id } = await params;
  const offer = await getRestaurantOfferById(id);

  if (!offer) {
    notFound();
  }

  const listed = formatListedDate(offer.createdAt);
  const verifyLabel = offer.confirmed
    ? listed
      ? `Confirmed · Listed ${listed}`
      : "Confirmed"
    : listed
      ? `Last checked ${listed}`
      : "Unconfirmed";

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
            <FreeBadge />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">
            {offer.restaurantName}
          </h1>
          <p className="mt-3 text-gray-700">{offer.offerSummary}</p>
          <div className="mt-3">
            <VerificationBadge label={verifyLabel} />
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
              <dd>{offer.eligibleDays.join(", ")}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-500">Offer time</dt>
              <dd>{offer.eligibleHours}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-500">
                Maximum child age
              </dt>
              <dd>
                {offer.maximumChildAge
                  ? `${offer.maximumChildAge} and under`
                  : "Not specified"}
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
                {offer.dineInOnly ? "Dine-in only" : "Dine-in or takeaway"}
              </dd>
            </div>
          </dl>

          <p className="mt-8 rounded-lg bg-orange-50 p-4 text-sm text-gray-700">
            Restaurant promotions can change without notice. Please confirm the
            offer directly with the restaurant before visiting.
          </p>
        </article>
      </section>
    </main>
  );
}
