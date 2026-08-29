export function restaurantOfferDetailPath(id: string): string {
  return `/kids-eat-free/${encodeURIComponent(id)}`;
}

export function getRestaurantOfferHref(offer: { id: string }): string {
  return restaurantOfferDetailPath(offer.id);
}

export function decodeRestaurantOfferId(raw: string): string {
  if (!raw) return raw;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
