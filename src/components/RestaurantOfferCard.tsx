import type { RestaurantOffer } from "@/types";

type RestaurantOfferCardProps = {
  offer: RestaurantOffer;
  variant?: "default" | "upcoming";
};

export default function RestaurantOfferCard({
  offer,
  variant = "default",
}: RestaurantOfferCardProps) {
  if (variant === "upcoming") {
    return (
      <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold leading-snug text-gray-900">
          {offer.restaurantName}
        </h2>

        <p className="mt-1.5 line-clamp-2 text-sm text-gray-600">
          {offer.offerSummary}
        </p>

        <dl className="mt-3 space-y-1 text-sm text-gray-700">
          <div>
            <dt className="inline font-semibold">Available: </dt>
            <dd className="inline">{offer.eligibleDays.join(", ")}</dd>
          </div>

          <div>
            <dt className="inline font-semibold">Hours: </dt>
            <dd className="inline">{offer.eligibleHours}</dd>
          </div>

          <div>
            <dt className="inline font-semibold">Adult purchase: </dt>
            <dd className="inline">
              {offer.adultPurchaseRequired ? "Required" : "Not required"}
            </dd>
          </div>

          <div>
            <dt className="inline font-semibold">Maximum child age: </dt>
            <dd className="inline">
              {offer.maximumChildAge
                ? `${offer.maximumChildAge} years`
                : "Not specified"}
            </dd>
          </div>
        </dl>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-orange-800">
            {offer.neighborhood}
          </span>

          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-green-800">
            Free
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-800">
          {offer.neighborhood}
        </span>

        <span
          className={
            offer.confirmed
              ? "rounded-full bg-green-100 px-3 py-1 text-green-800"
              : "rounded-full bg-yellow-100 px-3 py-1 text-yellow-800"
          }
        >
          {offer.confirmed ? "Confirmed" : "Unconfirmed"}
        </span>
      </div>

      <h2 className="text-xl font-semibold text-gray-900">
        {offer.restaurantName}
      </h2>

      <p className="mt-2 text-gray-600">{offer.offerSummary}</p>

      <dl className="mt-4 space-y-2 text-sm text-gray-700">
        <div>
          <dt className="inline font-semibold">Available: </dt>
          <dd className="inline">{offer.eligibleDays.join(", ")}</dd>
        </div>

        <div>
          <dt className="inline font-semibold">Hours: </dt>
          <dd className="inline">{offer.eligibleHours}</dd>
        </div>

        <div>
          <dt className="inline font-semibold">Adult purchase: </dt>
          <dd className="inline">
            {offer.adultPurchaseRequired ? "Required" : "Not required"}
          </dd>
        </div>

        <div>
          <dt className="inline font-semibold">Maximum child age: </dt>
          <dd className="inline">
            {offer.maximumChildAge
              ? `${offer.maximumChildAge} years`
              : "Not specified"}
          </dd>
        </div>

        <div>
          <dt className="inline font-semibold">Dining option: </dt>
          <dd className="inline">
            {offer.dineInOnly ? "Dine-in only" : "Dine-in or takeaway"}
          </dd>
        </div>
      </dl>

      {!offer.confirmed && (
        <p className="mt-5 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-900">
          This offer has not yet been confirmed. Please contact the restaurant
          before visiting.
        </p>
      )}
    </article>
  );
}
