"use client";

import { useEffect, useRef, useState } from "react";
import ActivityCard from "@/components/ActivityCard";
import type { Activity } from "@/types";

const VISIBLE_COUNT = 3;

type VerticalActivityCarouselProps = {
  activities: Activity[];
};

export default function VerticalActivityCarousel({
  activities,
}: VerticalActivityCarouselProps) {
  const scrollRef = useRef<HTMLUListElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const needsCarousel = activities.length > VISIBLE_COUNT;

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollUp(el.scrollTop > 2);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 2);
  }

  useEffect(() => {
    updateScrollState();
  }, [activities]);

  function scrollByCard(direction: "up" | "down") {
    const el = scrollRef.current;
    if (!el) return;

    const firstItem = el.querySelector("li");
    const itemHeight = firstItem
      ? firstItem.getBoundingClientRect().height + 8
      : 40;

    el.scrollBy({
      top: direction === "down" ? itemHeight : -itemHeight,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative">
      {needsCarousel && canScrollUp ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-sky-50 to-transparent"
        />
      ) : null}

      <ul
        ref={scrollRef}
        onScroll={updateScrollState}
        className={
          needsCarousel
            ? "inline-flex w-max max-w-full flex-col space-y-1.5 max-h-[7.5rem] overflow-y-auto overscroll-contain scroll-smooth snap-y snap-mandatory pr-1 [scrollbar-width:thin] [&_li]:snap-start"
            : "inline-flex w-max max-w-full flex-col space-y-1.5"
        }
      >
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            variant="compact"
          />
        ))}
      </ul>

      {needsCarousel && canScrollDown ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-8 z-10 h-6 bg-gradient-to-t from-sky-50 to-transparent"
        />
      ) : null}

      {needsCarousel ? (
        <div className="mt-1.5 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => scrollByCard("up")}
            disabled={!canScrollUp}
            aria-label="Show previous activities"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-sky-200 bg-white text-sm text-gray-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-35 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => scrollByCard("down")}
            disabled={!canScrollDown}
            aria-label="Show more activities"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-sky-200 bg-white text-sm text-gray-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-35 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            ▼
          </button>
        </div>
      ) : null}
    </div>
  );
}
