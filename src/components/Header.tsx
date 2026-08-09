"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationItem = {
  label: string;
  href: string;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Free Activities",
    href: "/activities",
  },
  {
    label: "Kids Eat Free",
    href: "/kids-eat-free",
  },
  {
    label: "Construction Sites",
    href: "/construction-sites",
  },
];

function isCurrentRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-xl"
          >
            🎈
          </span>

          <span>
            <span className="block font-bold text-gray-900">
              The Free Kid List
            </span>

            <span className="block text-xs text-gray-500">
              Fun activities in the Roscoe Village, Lakeview, and Lincoln Park
              neighborhoods
            </span>
          </span>
        </Link>

        <nav aria-label="Main navigation">
          <ul className="flex flex-wrap items-center gap-2">
            {navigationItems.map((item) => {
              const isActive = isCurrentRoute(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      isActive
                        ? "inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        : "inline-flex rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}

            <li>
              <Link
                href="/login"
                aria-current={pathname === "/login" ? "page" : undefined}
                className={
                  pathname === "/login"
                    ? "inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    : "inline-flex rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                }
              >
                Login
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
