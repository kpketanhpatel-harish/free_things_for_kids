import { coordsForRestaurant } from "@/lib/restaurantOfferCoords";
import { createClient } from "@/lib/supabase/server";
import type { DayOfWeek, RestaurantOffer } from "@/types";

type RestaurantOfferRow = {
  id: string;
  restaurant_name: string;
  neighborhood: string | null;
  eligible_days: string[] | null;
  eligible_hours: string | null;
  offer_summary: string | null;
  adult_purchase_required: boolean;
  maximum_child_age: number | null;
  dine_in_only: boolean;
  confirmed: boolean;
  address: string | null;
  website: string | null;
  source_url: string | null;
  source_name: string | null;
  notes: string | null;
  last_checked?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string | null;
};

function mapRestaurantOffer(row: RestaurantOfferRow): RestaurantOffer {
  const mapped: RestaurantOffer = {
    id: row.id,
    restaurantName: row.restaurant_name,
    neighborhood: row.neighborhood ?? "Chicago",
    eligibleDays: (row.eligible_days ?? []) as DayOfWeek[],
    eligibleHours: row.eligible_hours ?? "See offer details",
    offerSummary: row.offer_summary ?? "Kids eat free — see source for details.",
    adultPurchaseRequired: row.adult_purchase_required,
    maximumChildAge: row.maximum_child_age ?? undefined,
    dineInOnly: row.dine_in_only,
    confirmed: row.confirmed,
    address: row.address ?? undefined,
    website: row.website ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    sourceName: row.source_name ?? undefined,
    notes: row.notes ?? undefined,
    lastChecked:
      row.last_checked ??
      (row.source_url?.includes("friendofamom.com") ? "2026-08-16" : undefined),
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    createdAt: row.created_at ?? undefined,
  };

  const coords = coordsForRestaurant(mapped);
  if (coords) {
    mapped.latitude = coords.latitude;
    mapped.longitude = coords.longitude;
  }

  return mapped;
}

const SELECT_WITH_GEO =
  "id, restaurant_name, neighborhood, eligible_days, eligible_hours, offer_summary, adult_purchase_required, maximum_child_age, dine_in_only, confirmed, address, website, source_url, source_name, notes, last_checked, latitude, longitude, created_at";

const SELECT_BASE =
  "id, restaurant_name, neighborhood, eligible_days, eligible_hours, offer_summary, adult_purchase_required, maximum_child_age, dine_in_only, confirmed, address, website, source_url, source_name, notes, created_at";

async function loadOfferRows(id?: string): Promise<RestaurantOfferRow[]> {
  const supabase = await createClient();
  const apply = (select: string) => {
    let query = supabase
      .from("restaurant_offers")
      .select(select)
      .eq("status", "published")
      .order("restaurant_name", { ascending: true });
    if (id) query = query.eq("id", id);
    return query;
  };

  const withGeo = await apply(SELECT_WITH_GEO);
  if (!withGeo.error) {
    return (withGeo.data ?? []) as unknown as RestaurantOfferRow[];
  }

  const fallback = await apply(SELECT_BASE);
  if (fallback.error) {
    throw new Error(`Failed to load restaurant offers: ${fallback.error.message}`);
  }
  return (fallback.data ?? []) as unknown as RestaurantOfferRow[];
}

export async function getRestaurantOffers(): Promise<RestaurantOffer[]> {
  const rows = await loadOfferRows();
  return rows.map(mapRestaurantOffer);
}

export async function getRestaurantOfferById(
  id: string,
): Promise<RestaurantOffer | null> {
  const rows = await loadOfferRows(id);
  const row = rows[0];
  return row ? mapRestaurantOffer(row) : null;
}
