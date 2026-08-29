"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { getRestaurantOfferHref } from "@/lib/restaurantOfferPath";
import {
  ageHeadline,
  formatOfferWhen,
} from "@/lib/restaurantOfferSchedule";
import type { RestaurantOffer } from "@/types";
import "leaflet/dist/leaflet.css";

type KidsEatFreeMapProps = {
  offers: RestaurantOffer[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

const CHICAGO_CENTER: [number, number] = [41.91, -87.67];
const CITY_ZOOM = 12;

const markerIcon = L.divIcon({
  className: "kef-map-marker",
  html: `<span style="display:block;width:44px;height:44px;border-radius:9999px;background:#c2410c;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>`,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -40],
});

const selectedIcon = L.divIcon({
  className: "kef-map-marker",
  html: `<span style="display:block;width:44px;height:44px;border-radius:9999px;background:#1d4ed8;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>`,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -40],
});

function mappableOffers(offers: RestaurantOffer[]): RestaurantOffer[] {
  return offers.filter(
    (offer) =>
      typeof offer.latitude === "number" &&
      typeof offer.longitude === "number" &&
      Number.isFinite(offer.latitude) &&
      Number.isFinite(offer.longitude),
  );
}

function FitDisplayed({
  offers,
  selectedId,
}: {
  offers: RestaurantOffer[];
  selectedId?: string | null;
}) {
  const map = useMap();
  const selected = offers.find((offer) => offer.id === selectedId);
  const pinKey = offers
    .map((offer) => `${offer.id}:${offer.latitude},${offer.longitude}`)
    .join("|");

  useEffect(() => {
    if (
      selected &&
      typeof selected.latitude === "number" &&
      typeof selected.longitude === "number"
    ) {
      map.flyTo([selected.latitude, selected.longitude], 15, { duration: 0.35 });
      return;
    }

    if (offers.length === 0) {
      map.setView(CHICAGO_CENTER, CITY_ZOOM);
      return;
    }
    if (offers.length === 1) {
      map.setView([offers[0].latitude as number, offers[0].longitude as number], 14);
      return;
    }

    const bounds = L.latLngBounds(
      offers.map(
        (offer) =>
          [offer.latitude as number, offer.longitude as number] as [
            number,
            number,
          ],
      ),
    );
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
  }, [map, pinKey, selected]);

  return null;
}

export default function KidsEatFreeMap({
  offers,
  selectedId,
  onSelect,
}: KidsEatFreeMapProps) {
  const pins = useMemo(() => mappableOffers(offers), [offers]);

  if (pins.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
      <MapContainer
        center={CHICAGO_CENTER}
        zoom={CITY_ZOOM}
        scrollWheelZoom={false}
        className="z-0 h-[280px] w-full md:h-[400px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitDisplayed offers={pins} selectedId={selectedId} />
        {pins.map((offer) => (
          <Marker
            key={offer.id}
            position={[offer.latitude as number, offer.longitude as number]}
            icon={offer.id === selectedId ? selectedIcon : markerIcon}
            eventHandlers={{
              click: () => onSelect?.(offer.id),
            }}
          >
            <Popup>
              <div className="max-w-[220px] space-y-1 text-sm">
                <p className="font-semibold text-gray-900">
                  {offer.restaurantName}
                </p>
                <p className="text-gray-600">{offer.neighborhood}</p>
                <p className="text-gray-800">{formatOfferWhen(offer)}</p>
                {ageHeadline(offer) ? (
                  <p className="text-gray-700">{ageHeadline(offer)}</p>
                ) : null}
                <a
                  href={getRestaurantOfferHref(offer)}
                  className="inline-flex min-h-11 items-center font-medium text-orange-800"
                >
                  View offer
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
