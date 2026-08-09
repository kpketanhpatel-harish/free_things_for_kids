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
import type { ConstructionSite } from "@/types";
import "leaflet/dist/leaflet.css";

type ConstructionSitesMapProps = {
  sites: ConstructionSite[];
};

const DEFAULT_CENTER: [number, number] = [41.94, -87.66];
const DEFAULT_ZOOM = 11;

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [40, 40], maxZoom: 13 });
  }, [map, positions]);

  return null;
}

export default function ConstructionSitesMap({
  sites,
}: ConstructionSitesMapProps) {
  const mappable = useMemo(
    () =>
      sites.filter(
        (site) =>
          typeof site.latitude === "number" &&
          typeof site.longitude === "number" &&
          Number.isFinite(site.latitude) &&
          Number.isFinite(site.longitude),
      ),
    [sites],
  );

  const positions = useMemo(
    () =>
      mappable.map(
        (site) => [site.latitude as number, site.longitude as number] as [
          number,
          number,
        ],
      ),
    [mappable],
  );

  if (mappable.length === 0) {
    return (
      <div className="flex h-[22rem] items-center justify-center rounded-2xl border border-dashed border-amber-200 bg-amber-50 text-sm text-amber-900 md:h-[28rem]">
        Map will appear once sites include latitude and longitude.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-100 shadow-sm">
      <MapContainer
        center={positions[0] ?? DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={false}
        className="z-0 h-[22rem] w-full md:h-[28rem]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds positions={positions} />
        {mappable.map((site) => (
          <Marker
            key={site.id}
            position={[site.latitude as number, site.longitude as number]}
            icon={markerIcon}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-gray-900">{site.title}</p>
                {site.neighborhood ? (
                  <p className="text-gray-600">{site.neighborhood}</p>
                ) : null}
                {site.address ? (
                  <p className="text-gray-600">{site.address}</p>
                ) : null}
                {site.projectType ? (
                  <p className="text-gray-700">{site.projectType}</p>
                ) : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
