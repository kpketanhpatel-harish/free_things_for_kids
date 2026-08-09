import type { ConstructionSite } from "@/types";

type ConstructionSiteCardProps = {
  site: ConstructionSite;
  highlighted?: boolean;
};

function formatDateRange(start?: string, end?: string): string | null {
  if (!start && !end) return null;
  if (start && end) return `${start} → ${end}`;
  return start ?? end ?? null;
}

export default function ConstructionSiteCard({
  site,
  highlighted = false,
}: ConstructionSiteCardProps) {
  const dateRange = formatDateRange(site.activeStart, site.activeEnd);

  return (
    <article
      className={
        highlighted
          ? "rounded-2xl border border-amber-300 bg-white p-5 shadow-sm ring-1 ring-amber-100"
          : "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      }
    >
      <div className="mb-3 flex flex-wrap gap-2 text-sm">
        {site.neighborhood ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
            {site.neighborhood}
          </span>
        ) : null}
        {site.projectType ? (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
            {site.projectType}
          </span>
        ) : null}
        {typeof site.kidInterestScore === "number" ? (
          <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-800">
            Kid interest {site.kidInterestScore}/10
          </span>
        ) : null}
      </div>

      <h3 className="text-xl font-semibold text-gray-900">{site.title}</h3>

      {site.summary ? (
        <p className="mt-2 line-clamp-3 text-gray-600">{site.summary}</p>
      ) : null}

      <dl className="mt-4 space-y-1 text-sm text-gray-700">
        {site.address ? (
          <div>
            <dt className="inline font-semibold">Address: </dt>
            <dd className="inline">{site.address}</dd>
          </div>
        ) : null}

        {site.likelyMachinery ? (
          <div>
            <dt className="inline font-semibold">Machinery: </dt>
            <dd className="inline">{site.likelyMachinery}</dd>
          </div>
        ) : null}

        {dateRange ? (
          <div>
            <dt className="inline font-semibold">Active window: </dt>
            <dd className="inline">{dateRange}</dd>
          </div>
        ) : null}

        {site.viewingSuitability ? (
          <div>
            <dt className="inline font-semibold">Safe vantage: </dt>
            <dd className="inline">{site.viewingSuitability}</dd>
          </div>
        ) : null}
      </dl>

      {site.sourceUrl ? (
        <a
          href={site.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex font-medium text-amber-800 hover:underline focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          View source
        </a>
      ) : null}
    </article>
  );
}
