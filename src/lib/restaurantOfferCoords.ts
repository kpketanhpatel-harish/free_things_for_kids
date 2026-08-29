import type { RestaurantOffer } from "@/types";

type CoordHit = {
  name: string;
  street?: string;
  lat: number;
  lng: number;
};

const KNOWN_COORDS: CoordHit[] = [
  { name: "crosby", street: "southport", lat: 41.9451152, lng: -87.6637061 },
  { name: "tuco", street: "southport", lat: 41.9433087, lng: -87.6640752 },
  { name: "little goat", street: "southport", lat: 41.9423668, lng: -87.6637206 },
  { name: "frasca", street: "paulina", lat: 41.9431375, lng: -87.6714232 },
  { name: "swift", street: "clark", lat: 41.9473681, lng: -87.6568915 },
  { name: "cheesie", street: "belmont", lat: 41.9400486, lng: -87.6537882 },
  { name: "serio", street: "belmont", lat: 41.9399227, lng: -87.6715295 },
  { name: "farm bar", street: "wellington", lat: 41.9363557, lng: -87.6614087 },
  { name: "farm bar", street: "montrose", lat: 41.9615449, lng: -87.6784987 },
  { name: "honey butter", street: "elston", lat: 41.9424929, lng: -87.7026676 },
  { name: "warbler", street: "lincoln", lat: 41.9642595, lng: -87.6853788 },
  { name: "harding", street: "milwaukee", lat: 41.9307708, lng: -87.7104473 },
  { name: "perch", street: "division", lat: 41.9033893, lng: -87.6762203 },
  { name: "chop shop", street: "north", lat: 41.9102671, lng: -87.6787837 },
  { name: "parlay", street: "wrightwood", lat: 41.9292878, lng: -87.6533238 },
  { name: "tacombi", street: "peoria", lat: 41.8839497, lng: -87.6499577 },
  { name: "diego", street: "ogden", lat: 41.8908482, lng: -87.6594489 },
  { name: "chicken", street: "king", lat: 41.785564, lng: -87.6157495 },
  { name: "ambar", street: "clark", lat: 41.8949906, lng: -87.631462 },
  { name: "land", street: "wacker", lat: 41.8877566, lng: -87.6253054 },
  { name: "community", street: "milwaukee", lat: 41.9540122, lng: -87.7488493 },
  { name: "bad apple", street: "lincoln", lat: 41.959724, lng: -87.6828837 },
  { name: "bad apple", street: "belden", lat: 41.9237973, lng: -87.6461095 },
  { name: "fogo", street: "lasalle", lat: 41.8942563, lng: -87.6321226 },
  { name: "big star", street: "damen", lat: 41.9091742, lng: -87.6771281 },
  { name: "big star", street: "clark", lat: 41.9481784, lng: -87.6575019 },
  { name: "big star", street: "ogden", lat: 41.8923954, lng: -87.6576091 },
  { name: "ihop", street: "halsted", lat: 41.9506067, lng: -87.6497293 },
  { name: "smashburger", street: "michigan", lat: 41.8879709, lng: -87.625064 },
  { name: "smashburger", street: "foster", lat: 41.9744384, lng: -87.745906 },
];

export function coordsForRestaurant(offer: Pick<
  RestaurantOffer,
  "restaurantName" | "address" | "neighborhood" | "latitude" | "longitude"
>): { latitude: number; longitude: number } | null {
  if (
    typeof offer.latitude === "number" &&
    typeof offer.longitude === "number" &&
    Number.isFinite(offer.latitude) &&
    Number.isFinite(offer.longitude)
  ) {
    return { latitude: offer.latitude, longitude: offer.longitude };
  }

  const name = (offer.restaurantName ?? "").toLowerCase();
  const address = (offer.address ?? "").toLowerCase();

  const hits = KNOWN_COORDS.filter((row) => name.includes(row.name));
  const streetHit = hits.find(
    (row) => row.street && address.includes(row.street),
  );
  if (streetHit) {
    return { latitude: streetHit.lat, longitude: streetHit.lng };
  }

  if (!address && hits.length === 1) {
    return { latitude: hits[0].lat, longitude: hits[0].lng };
  }

  return null;
}
