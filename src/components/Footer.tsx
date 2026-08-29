import Link from "next/link";

import { SITE_NAME } from "@/lib/site";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-900 text-gray-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
        <div>
          <h2 className="font-semibold text-white">{SITE_NAME}</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-gray-400">
            Free kids activities, neighborhood events, and kids-eat-free
            deals in Lakeview, Roscoe Village, and Lincoln Park.
          </p>
        </div>

        <div className="md:text-right">
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end">
              <li>
                <Link
                  href="/"
                  className="text-sm transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Today
                </Link>
              </li>
              <li>
                <Link
                  href="/calendar"
                  className="text-sm transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Calendar
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
              <li>
                <Link
                  href="/search"
                  className="text-sm transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Search
                </Link>
              </li>
              <li>
                <Link
                  href="/construction-sites"
                  className="text-sm transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Construction Sites
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  About
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
          © {currentYear} {SITE_NAME}
        </div>
      </div>
    </footer>
  );
}
