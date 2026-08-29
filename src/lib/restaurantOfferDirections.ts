export function restaurantDirectionsUrl(offer: {
  latitude?: number;
  longitude?: number;
  address?: string;
}): string | null {
  if (
    typeof offer.latitude === "number" &&
    typeof offer.longitude === "number" &&
    Number.isFinite(offer.latitude) &&
    Number.isFinite(offer.longitude)
  ) {
    return `https://www.google.com/maps/dir/?api=1&destination=${offer.latitude},${offer.longitude}`;
  }
  if (offer.address?.trim()) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(offer.address)}`;
  }
  return null;
}
