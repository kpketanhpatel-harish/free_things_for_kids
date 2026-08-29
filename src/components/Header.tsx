"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import FeedbackButton from "@/components/FeedbackButton";
import { SITE_AREA, SITE_NAME } from "@/lib/site";

type NavigationItem = {
  label: string;
  href: string;
};

const primaryItems: NavigationItem[] = [
  { label: "Today", href: "/" },
  { label: "Calendar", href: "/calendar" },
  { label: "Kids Eat Free", href: "/kids-eat-free" },
  { label: "Search", href: "/search" },
];

const moreItems: NavigationItem[] = [
  { label: "Activities", href: "/activities" },
  { label: "Construction Sites", href: "/construction-sites" },
  { label: "About", href: "/about" },
  { label: "Login", href: "/login" },
];

function isCurrentRoute(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navClass(active: boolean) {
  return active
    ? "inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    : "inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-lg"
          >
            🎈
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-gray-900 sm:text-base">
              {SITE_NAME}
            </span>
            <span className="hidden truncate text-xs text-gray-500 sm:block">
              {SITE_AREA}
            </span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {primaryItems.map((item) => {
              const active = isCurrentRoute(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={navClass(active)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <details className="relative">
                <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-lg px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-details-marker]:hidden">
                  More
                </summary>
                <div className="absolute right-0 mt-1 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                  <ul className="space-y-1">
                    {moreItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="block rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                    <li className="px-1 pt-1">
                      <FeedbackButton />
                    </li>
                  </ul>
                </div>
              </details>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <details className="relative">
            <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-lg px-3 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-details-marker]:hidden">
              Menu
            </summary>
            <div className="absolute right-0 mt-1 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
              <ul className="space-y-1">
                {moreItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block min-h-11 rounded-lg px-3 py-2 text-sm text-gray-800"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="px-1 pt-1">
                  <FeedbackButton />
                </li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
