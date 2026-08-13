import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why The Free Kid List exists: hyper-local free kids activities in Roscoe Village, Lakeview, and Lincoln Park.",
};

const YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/jsbkNszA9i4";

export default function AboutPage() {
  return (
    <main className="bg-sky-50">
      <section className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-sky-100 via-white to-amber-50">
        <div className="mx-auto max-w-3xl px-4 py-14 md:py-20">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-700">
            Why I built this
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            The Free Kid List
          </h1>

          <p className="mt-4 text-2xl font-semibold leading-snug text-slate-800 md:text-3xl">
            The good stuff is local. It shouldn&apos;t be this hard to find.
          </p>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-700">
            Most free kids activities in Roscoe Village, Lakeview, and Lincoln
            Park never show up where parents actually look. They live on one-off
            websites, volunteer flyers in store windows, and word of mouth.{" "}
            <span className="font-medium text-gray-900">
              The Free Kid List
            </span>{" "}
            pulls those neighborhood gems into one place—so families can find
            what&apos;s happening nearby without digging.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 md:py-12">
        <div className="overflow-hidden rounded-2xl bg-slate-900 shadow-lg ring-1 ring-slate-900/10">
          <div className="relative aspect-video w-full">
            <iframe
              src={YOUTUBE_EMBED_URL}
              title="Why I built The Free Kid List"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          A quick note from a neighbor who put up the flyers.{" "}
          <a
            href="https://youtu.be/jsbkNszA9i4"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Watch on YouTube
          </a>
        </p>
      </section>

      <section className="mx-auto max-w-3xl space-y-12 px-4 pb-10 md:pb-14">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Why search falls short
          </h2>
          <p className="mt-3 text-base leading-relaxed text-gray-700">
            Google and AI search favor the big, advertised, and obvious:
            citywide festivals, sponsored events, parks you already know.
            What&apos;s missing is the hyper-local calendar—story times,
            community center programs, farmers markets, library events,
            neighborhood org meetups—the free things that make a week with kids
            feel full.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What&apos;s hiding in plain sight
          </h2>
          <p className="mt-3 text-base leading-relaxed text-gray-700">
            Libraries, community centers, neighborhood groups, firehouses,
            bookshops, markets, and more already host meaningful free
            activities. They&apos;re built for our kids. They&apos;re just
            scattered. We collect them so more families can actually show up.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Why it matters
          </h2>
          <p className="mt-3 text-base leading-relaxed text-gray-700">
            Free local activities are part of equal opportunity. They give kids
            shared experiences regardless of income, and they knit neighborhoods
            together. Supporting them isn&apos;t just convenience—it&apos;s
            community.
          </p>
        </div>

        <div className="border-t border-sky-200 pt-8">
          <Link
            href="/activities"
            className="inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            See what&apos;s free nearby
          </Link>
        </div>
      </section>
    </main>
  );
}
