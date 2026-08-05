"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    router.push(`/activities?search=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <label htmlFor="home-search" className="sr-only">
        Search activities and restaurants
      </label>
      <div className="flex gap-2">
        <input
          id="home-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search activities and restaurants..."
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="submit"
          className="rounded-xl bg-blue-700 px-5 py-2.5 font-medium text-white transition hover:bg-blue-800"
        >
          Search
        </button>
      </div>
    </form>
  );
}
