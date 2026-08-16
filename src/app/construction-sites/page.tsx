import type { Metadata } from "next";
import ConstructionSiteCard from "@/components/ConstructionSiteCard";
import ConstructionSitesMapLoader from "@/components/ConstructionSitesMapLoader";
import {
  getConstructionSites,
  partitionConstructionSites,
} from "@/lib/constructionSites";

export const metadata: Metadata = {
  title: "Construction Sites",
  description:
    "Kid-friendly construction watch sites around Chicago, prioritizing Roscoe Village, Lakeview, and Lincoln Park.",
};

export default async function ConstructionSitesPage() {
  const sites = await getConstructionSites();
  const { priority, other } = partitionConstructionSites(sites);

  return (
    <main className="bg-amber-50/40">
      <section className="mx-auto max-w-6xl px-4 py-12">
        <p
          role="note"
          className="mb-8 rounded-2xl border-2 border-amber-300 bg-amber-100 px-6 py-5 text-center text-2xl font-bold text-amber-950 md:text-3xl"
        >
          More sites coming soon
        </p>

        <div className="mb-8">
          <p className="font-medium text-amber-800">
            The Free Kid List Chicago
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            Construction Watch Sites
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            Spot cranes, excavators, and big builds from safe public sidewalks.
            Neighborhood favorites in Roscoe Village, Lakeview, and Lincoln Park
            are listed first.
          </p>

          <p className="mt-3 max-w-2xl text-sm text-gray-500">
            Safety first: observe only from open public sidewalks, parks, or
            other lawful public space. Never enter a work zone.
          </p>
        </div>

        <div className="mb-10">
          <ConstructionSitesMapLoader sites={sites} />
          <p className="mt-2 text-sm text-gray-500">
            {sites.filter((site) => site.latitude != null && site.longitude != null).length}{" "}
            sites shown on the map
            {sites.length
              ? ` · ${sites.length} total listed`
              : ""}
          </p>
        </div>

        {sites.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-gray-600 shadow-sm">
            No construction sites loaded yet. Run{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">
              npm run import:construction-sites -- --promote
            </code>{" "}
            after creating the Supabase tables.
          </p>
        ) : (
          <div className="space-y-12">
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                Near Roscoe Village, Lakeview &amp; Lincoln Park
              </h2>
              {priority.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {priority.map((site) => (
                    <ConstructionSiteCard
                      key={site.id}
                      site={site}
                      highlighted
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl bg-white p-5 text-gray-600 shadow-sm">
                  No priority-neighborhood sites in the current dataset.
                </p>
              )}
            </div>

            {other.length > 0 ? (
              <div>
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  More Chicago sites
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {other.map((site) => (
                    <ConstructionSiteCard key={site.id} site={site} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}
