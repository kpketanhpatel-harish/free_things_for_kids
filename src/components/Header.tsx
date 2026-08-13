"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import FeedbackButton from "@/components/FeedbackButton";

type NavigationItem = {
  label: string;
  href: string;
};

const navigationItems: NavigationItem[] = [
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
  {
    label: "About",
    href: "/about",
  },
];

function isCurrentRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
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
              The Free Kid List
            </span>

            <span className="hidden truncate text-xs text-gray-500 lg:block">
              Roscoe Village, Lakeview &amp; Lincoln Park
            </span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="min-w-0">
          <ul className="flex flex-nowrap items-center gap-1.5 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navigationItems.map((item) => {
              const isActive = isCurrentRoute(pathname, item.href);

              return (
                <li key={item.href} className="shrink-0">
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      isActive
                        ? "inline-flex rounded-lg bg-blue-700 px-2.5 py-1.5 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-3 sm:text-sm"
                        : "inline-flex rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-3 sm:text-sm"
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}

            <li className="shrink-0">
              <FeedbackButton />
            </li>

            <li className="shrink-0">
              <Link
                href="/login"
                aria-current={pathname === "/login" ? "page" : undefined}
                className={
                  pathname === "/login"
                    ? "inline-flex rounded-lg bg-blue-700 px-2.5 py-1.5 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-3 sm:text-sm"
                    : "inline-flex rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-900 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-3 sm:text-sm"
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
