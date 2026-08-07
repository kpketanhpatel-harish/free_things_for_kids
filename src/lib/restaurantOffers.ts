import { createClient } from "@/lib/supabase/server";
import type { DayOfWeek, RestaurantOffer } from "@/types";

type RestaurantOfferRow = {
  id: string;
  restaurant_name: string;
  neighborhood: string;
  eligible_days: string[];
  eligible_hours: string;
  offer_summary: string;
  adult_purchase_required: boolean;
  maximum_child_age: number | null;
  dine_in_only: boolean;
  confirmed: boolean;
};

function mapRestaurantOffer(row: RestaurantOfferRow): RestaurantOffer {
  return {
    id: row.id,
    restaurantName: row.restaurant_name,
    neighborhood: row.neighborhood,
    eligibleDays: row.eligible_days as DayOfWeek[],
    eligibleHours: row.eligible_hours,
    offerSummary: row.offer_summary,
    adultPurchaseRequired: row.adult_purchase_required,
    maximumChildAge: row.maximum_child_age ?? undefined,
    dineInOnly: row.dine_in_only,
    confirmed: row.confirmed,
  };
}

const restaurantOfferSelect =
  "id, restaurant_name, neighborhood, eligible_days, eligible_hours, offer_summary, adult_purchase_required, maximum_child_age, dine_in_only, confirmed";

export async function getRestaurantOffers(): Promise<RestaurantOffer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("restaurant_offers")
    .select(restaurantOfferSelect)
    .order("restaurant_name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load restaurant offers: ${error.message}`);
  }

  return (data ?? []).map((row) =>
    mapRestaurantOffer(row as RestaurantOfferRow),
  );
}

export async function getRestaurantOfferById(
  id: string,
): Promise<RestaurantOffer | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("restaurant_offers")
    .select(restaurantOfferSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load restaurant offer: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapRestaurantOffer(data as RestaurantOfferRow);
}
