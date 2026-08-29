"use client";

import { Component, useCallback, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { RestaurantOffer } from "@/types";

class MapErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const KidsEatFreeMap = dynamic(() => import("@/components/KidsEatFreeMap"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      className="flex h-[280px] items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-sm text-orange-900 md:h-[400px]"
    >
      Loading map…
    </div>
  ),
});

type KidsEatFreeMapLoaderProps = {
  offers: RestaurantOffer[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

export default function KidsEatFreeMapLoader({
  offers,
  selectedId,
  onSelect,
}: KidsEatFreeMapLoaderProps) {
  const [locationError, setLocationError] = useState<string | null>(null);
  const mappable = offers.filter(
    (offer) =>
      typeof offer.latitude === "number" &&
      typeof offer.longitude === "number",
  );

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Location is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationError(null);
        const nearest = mappable
          .map((offer) => ({
            offer,
            dist:
              Math.abs((offer.latitude as number) - position.coords.latitude) +
              Math.abs((offer.longitude as number) - position.coords.longitude),
          }))
          .sort((a, b) => a.dist - b.dist)[0];
        if (nearest) onSelect?.(nearest.offer.id);
      },
      () => {
        setLocationError("Location permission denied or unavailable.");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  }, [mappable, onSelect]);

  if (mappable.length === 0) {
    return null;
  }

  return (
    <MapErrorBoundary>
    <div>
      <div className="h-[280px] md:h-[400px]">
        <KidsEatFreeMap
          offers={offers}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={useMyLocation}
          className="inline-flex min-h-11 items-center rounded-full border border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          Use my location
        </button>
        {locationError ? (
          <p className="text-sm text-gray-500">{locationError}</p>
        ) : (
          <p className="text-sm text-gray-500">
            Optional. We only ask after you tap.
          </p>
        )}
      </div>
    </div>
    </MapErrorBoundary>
  );
}
