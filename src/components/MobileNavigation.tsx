"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

const items = [
  { href: "/", label: "Today", event: "today_selected" },
  { href: "/calendar", label: "Calendar", event: "calendar_opened" },
  { href: "/kids-eat-free", label: "Eat Free", event: "kids_eat_free_clicked" },
  { href: "/search", label: "Search", event: "search_used" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => trackEvent(item.event, { source: "bottom_nav" })}
                className={
                  active
                    ? "flex min-h-14 flex-col items-center justify-center text-xs font-semibold text-blue-800"
                    : "flex min-h-14 flex-col items-center justify-center text-xs font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
