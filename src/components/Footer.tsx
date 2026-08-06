import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-900 text-gray-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
        <div>
          <h2 className="font-semibold text-white">
            Free Things for Kids Chicago
          </h2>

          <p className="mt-3 max-w-md text-sm leading-6 text-gray-400">
            A local guide helping families discover free activities and
            kids-eat-free restaurant offers in selected Chicago neighborhoods.
          </p>
        </div>

        <div className="md:text-right">
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end">
              <li>
                <Link
                  href="/activities"
                  className="text-sm transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Free Activities
                </Link>
              </li>

              <li>
                <Link
                  href="/kids-eat-free"
                  className="text-sm transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Kids Eat Free
                </Link>
              </li>
            </ul>
          </nav>

          <p className="mt-4 text-xs leading-5 text-gray-400">
            Restaurant promotions can change without notice. Confirm offers
            directly with the restaurant before visiting.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-4 text-sm text-gray-500">
          © {currentYear} Free Things for Kids Chicago
        </div>
      </div>
    </footer>
  );
}
