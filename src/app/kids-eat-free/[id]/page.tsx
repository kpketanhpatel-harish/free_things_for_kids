import Link from "next/link";
import { notFound } from "next/navigation";
import { getRestaurantOfferById } from "@/lib/restaurantOffers";

type RestaurantOfferDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RestaurantOfferDetailPage({
  params,
}: RestaurantOfferDetailPageProps) {
  const { id } = await params;
  const offer = await getRestaurantOfferById(id);

  if (!offer) {
    notFound();
  }

  return (
    <main className="bg-gray-50">
      <section className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/kids-eat-free"
          className="text-sm font-medium text-orange-700 hover:underline focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          ← Back to Kids Eat Free
        </Link>

        <article className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <p className="font-medium text-orange-700">
            Free Things for Kids Chicago
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-800">
              {offer.neighborhood}
            </span>

            <span
              className={
                offer.confirmed
                  ? "rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
                  : "rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800"
              }
            >
              {offer.confirmed ? "Confirmed" : "Unconfirmed"}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            {offer.restaurantName}
          </h1>

          <p className="mt-3 text-lg text-gray-600">{offer.offerSummary}</p>

          {!offer.confirmed && (
            <p
              className="mt-5 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-900"
              role="alert"
            >
              This offer has not yet been confirmed. Contact the restaurant
              before visiting.
            </p>
          )}

          <dl className="mt-8 space-y-3 text-gray-700">
            <div>
              <dt className="font-semibold">Neighborhood</dt>
              <dd>{offer.neighborhood}</dd>
            </div>

            {offer.address ? (
              <div>
                <dt className="font-semibold">Address</dt>
                <dd>{offer.address}</dd>
              </div>
            ) : null}

            {offer.website ? (
              <div>
                <dt className="font-semibold">Website</dt>
                <dd>
                  <a
                    href={
                      /^https?:\/\//i.test(offer.website)
                        ? offer.website
                        : `https://${offer.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-orange-700 underline-offset-2 hover:underline"
                  >
                    {offer.website}
                  </a>
                </dd>
              </div>
            ) : null}

            <div>
              <dt className="font-semibold">Eligible days</dt>
              <dd>{offer.eligibleDays.join(", ")}</dd>
            </div>

            <div>
              <dt className="font-semibold">Eligible hours</dt>
              <dd>{offer.eligibleHours}</dd>
            </div>

            <div>
              <dt className="font-semibold">Adult purchase</dt>
              <dd>
                {offer.adultPurchaseRequired ? "Required" : "Not required"}
              </dd>
            </div>

            <div>
              <dt className="font-semibold">Maximum child age</dt>
              <dd>
                {offer.maximumChildAge
                  ? `${offer.maximumChildAge} years`
                  : "Not specified"}
              </dd>
            </div>

            <div>
              <dt className="font-semibold">Dining option</dt>
              <dd>
                {offer.dineInOnly ? "Dine-in only" : "Dine-in or takeaway"}
              </dd>
            </div>

            <div>
              <dt className="font-semibold">Confirmation status</dt>
              <dd>{offer.confirmed ? "Confirmed" : "Unconfirmed"}</dd>
            </div>
          </dl>

          <p className="mt-8 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            Restaurant promotions can change without notice. Please confirm the
            offer directly with the restaurant before visiting.
          </p>
        </article>
      </section>
    </main>
  );
}
