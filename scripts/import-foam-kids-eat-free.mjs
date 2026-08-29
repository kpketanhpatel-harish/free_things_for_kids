/**
 * Compare Friend of a Mom Kids Eat Free listings to restaurant_offers
 * and insert/enrich Chicago locations only.
 *
 * Prerequisites:
 *   Run supabase/restaurant_offers_map.sql in the SQL Editor (adds lat/lng/last_checked).
 *
 * Usage:
 *   npm run import:foam-kids-eat-free -- --dry-run
 *   npm run import:foam-kids-eat-free
 */

import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./lib/env.mjs";
import {
  FOAM_CHICAGO_OFFERS,
  FOAM_LAST_CHECKED,
  FOAM_SKIPPED,
  FOAM_SOURCE_NAME,
  FOAM_SOURCE_URL,
} from "./lib/foamKidsEatFreeOffers.mjs";
import {
  chooseKeeper,
  isWeakHours,
  mergeSourceName,
  rowMatchesFoam,
} from "./lib/matchRestaurantOffer.mjs";

loadEnv();

const dryRun = process.argv.includes("--dry-run");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SELECT_WITH_GEO =
  "id, restaurant_name, neighborhood, address, website, eligible_days, eligible_hours, offer_summary, adult_purchase_required, maximum_child_age, dine_in_only, confirmed, status, source_name, source_url, notes, latitude, longitude, last_checked";
const SELECT_BASE =
  "id, restaurant_name, neighborhood, address, website, eligible_days, eligible_hours, offer_summary, adult_purchase_required, maximum_child_age, dine_in_only, confirmed, status, source_name, source_url, notes";

function toWriteRow(foam, existing) {
  const keepHours =
    isWeakHours(foam.eligibleHours) && !isWeakHours(existing?.eligible_hours)
      ? existing.eligible_hours
      : foam.eligibleHours;

  return {
    restaurant_name: foam.restaurantName,
    neighborhood: foam.neighborhood,
    address: foam.address ?? existing?.address ?? null,
    website: existing?.website || foam.website || null,
    eligible_days: foam.eligibleDays,
    eligible_hours: keepHours,
    offer_summary: foam.offerSummary,
    notes: foam.restrictions ?? existing?.notes ?? null,
    adult_purchase_required: foam.adultPurchaseRequired,
    maximum_child_age:
      foam.maximumChildAge ?? existing?.maximum_child_age ?? null,
    dine_in_only: foam.dineInOnly !== false,
    status: "published",
    confirmed: existing?.confirmed === true,
    source_name: mergeSourceName(existing?.source_name, FOAM_SOURCE_NAME),
    source_url: FOAM_SOURCE_URL,
    last_checked: FOAM_LAST_CHECKED,
    latitude: foam.latitude ?? existing?.latitude ?? null,
    longitude: foam.longitude ?? existing?.longitude ?? null,
  };
}

function stripMissingColumns(row, hasGeo) {
  if (hasGeo) return row;
  const { latitude, longitude, last_checked, ...rest } = row;
  return rest;
}

const { data: geoProbe, error: geoError } = await supabase
  .from("restaurant_offers")
  .select("latitude, longitude, last_checked")
  .limit(1);

const hasGeo = !geoError;
if (geoError) {
  console.warn(
    "restaurant_offers is missing latitude/longitude/last_checked. Run supabase/restaurant_offers_map.sql, then re-run this import to store map coordinates.\n",
    geoError.message,
  );
}

const { data: rows, error: loadError } = await supabase
  .from("restaurant_offers")
  .select(hasGeo ? SELECT_WITH_GEO : SELECT_BASE);

if (loadError) {
  console.error(loadError.message);
  process.exit(1);
}

const existing = rows ?? [];
const claimed = new Set();
const report = {
  sourceListings: FOAM_CHICAGO_OFFERS.length,
  skipped: FOAM_SKIPPED,
  alreadyExisted: [],
  added: [],
  draftedDuplicates: [],
  ambiguous: [
    "Parlay Lincoln Park: source only says Tuesday evening; call ahead.",
    "Tacombi West Loop: Tuesday BOGO, no hours in the source.",
    "Smashburger: chain-wide Wednesday deal; only known Chicago addresses were added.",
    "Fogo de Chão: Chicago River North only; suburban locations skipped.",
    "IHOP: only the existing Lakeview Halsted location is listed.",
    "Cheesie's: free ice cream, not a free kids meal. Other Cheesie's locations were not added.",
    "Big Star Wicker Park: existing Monday 312Deals row left as-is (different day); weekend brunch added separately.",
  ],
};

for (const foam of FOAM_CHICAGO_OFFERS) {
  const matches = existing.filter(
    (row) => !claimed.has(row.id) && rowMatchesFoam(row, foam),
  );

  if (matches.length === 0) {
    const payload = {
      id: foam.id,
      ...stripMissingColumns(toWriteRow(foam, null), hasGeo),
    };
    report.added.push(
      `${foam.restaurantName} (${foam.neighborhood}) [${foam.id}]`,
    );
    if (dryRun) {
      console.log(`INSERT ${foam.id}  ${foam.restaurantName}`);
      continue;
    }
    const { error } = await supabase.from("restaurant_offers").insert(payload);
    if (error) {
      console.error(`Failed to insert ${foam.id}: ${error.message}`);
      process.exit(1);
    }
    continue;
  }

  const keeper = chooseKeeper(matches);
  claimed.add(keeper.id);
  report.alreadyExisted.push(
    `${foam.restaurantName} (${foam.neighborhood}) ← ${keeper.id} (${keeper.restaurant_name})`,
  );

  const extras = matches.filter((row) => row.id !== keeper.id);
  const payload = stripMissingColumns(toWriteRow(foam, keeper), hasGeo);

  if (dryRun) {
    console.log(
      `UPDATE ${keeper.id}  ${keeper.restaurant_name} → ${foam.restaurantName}`,
    );
    for (const extra of extras) {
      console.log(`  DRAFT duplicate ${extra.id}  ${extra.restaurant_name}`);
    }
    extras.forEach((extra) => claimed.add(extra.id));
    continue;
  }

  const { error: updateError } = await supabase
    .from("restaurant_offers")
    .update(payload)
    .eq("id", keeper.id);

  if (updateError) {
    console.error(`Failed to update ${keeper.id}: ${updateError.message}`);
    process.exit(1);
  }

  for (const extra of extras) {
    claimed.add(extra.id);
    report.draftedDuplicates.push(
      `${extra.id} (${extra.restaurant_name}) → duplicate of ${keeper.id}`,
    );
    const { error: draftError } = await supabase
      .from("restaurant_offers")
      .update({
        status: "draft",
        notes: `Duplicate of ${keeper.id} for the same location (Friend of a Mom import). Not deleted.`,
      })
      .eq("id", extra.id);
    if (draftError) {
      console.error(`Failed to draft ${extra.id}: ${draftError.message}`);
      process.exit(1);
    }
  }
}

console.log("\n=== Friend of a Mom import ===");
console.log(`Chicago listings in source file: ${report.sourceListings}`);
console.log(`Already existed / enriched: ${report.alreadyExisted.length}`);
for (const line of report.alreadyExisted) console.log(`  existed  ${line}`);
console.log(`Newly added: ${report.added.length}`);
for (const line of report.added) console.log(`  added    ${line}`);
console.log(`Duplicates drafted (not deleted): ${report.draftedDuplicates.length}`);
for (const line of report.draftedDuplicates) console.log(`  draft    ${line}`);
console.log("Skipped:");
for (const skip of report.skipped) console.log(`  skip     ${skip.name} — ${skip.reason}`);
console.log("Ambiguous / verify manually:");
for (const line of report.ambiguous) console.log(`  note     ${line}`);
if (dryRun) console.log("\nDry run — no writes.");
if (!hasGeo) {
  console.log(
    "\nCoordinates were not stored. Run supabase/restaurant_offers_map.sql and re-run this import.",
  );
}
