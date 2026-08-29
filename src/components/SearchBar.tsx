"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

type SearchBarProps = {
  action?: string;
  initialQuery?: string;
  placeholder?: string;
};

export default function SearchBar({
  action = "/search",
  initialQuery = "",
  placeholder = "Search story time, markets, parks…",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    trackEvent("search_used", { query: trimmed || "(empty)" });
    if (!trimmed) {
      router.push(action);
      return;
    }
    router.push(`${action}?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" role="search">
      <label htmlFor="site-search" className="sr-only">
        Search free kids activities
      </label>
      <div className="flex gap-2">
        <input
          id="site-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="inline-flex min-h-11 items-center rounded-xl border border-gray-300 px-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Clear
          </button>
        ) : null}
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-xl bg-blue-700 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
      </div>
    </form>
  );
}
