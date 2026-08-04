import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-sky-50">
      <section className="mx-auto flex max-w-6xl flex-col px-4 py-16">
        <div className="max-w-3xl">
          <p className="font-semibold text-blue-700">
            Chicago family guide
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Find free things to do with your kids
          </h1>

          <p className="mt-6 text-lg text-gray-600">
            Discover free activities and kids-eat-free restaurant offers
            in Lakeview, Roscoe Village, and Lincoln Park.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Link
            href="/activities"
            className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <span className="text-4xl" aria-hidden="true">
              🎨
            </span>

            <h2 className="mt-5 text-2xl font-semibold text-gray-900">
              Free Activities
            </h2>

            <p className="mt-2 text-gray-600">
              Find story times, workshops, outdoor events, and family
              programs.
            </p>
          </Link>

          <Link
            href="/kids-eat-free"
            className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <span className="text-4xl" aria-hidden="true">
              🍽️
            </span>

            <h2 className="mt-5 text-2xl font-semibold text-gray-900">
              Kids Eat Free
            </h2>

            <p className="mt-2 text-gray-600">
              Find restaurant offers and understand their requirements.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
