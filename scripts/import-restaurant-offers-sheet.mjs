/**
 * Import chicago_kids_restaurant_deals Google Sheet → staging_restaurant_offers,
 * then optionally promote normalized rows into restaurant_offers.
 *
 * Prerequisites:
 * 1. Run supabase/staging_restaurant_offers.sql
 * 2. Run supabase/restaurant_offers_schema_updates.sql
 * 3. Add SUPABASE_SERVICE_ROLE_KEY to .env.local
 *
 * Usage:
 *   npm run import:restaurant-offers
 *   npm run import:restaurant-offers -- --promote
 *   npm run import:restaurant-offers -- --promote --dry-run
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { parseCsv } from "./lib/csv.mjs";
import { normalizeSheetRow } from "./lib/normalizeRestaurantOffer.mjs";

const DEFAULT_SHEET_ID = "1bDU3aHIfOZUTMvQOv0_pm2vFAB-grP14Q3VP-j5e4ts";
const DEFAULT_GID = "0";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    throw new Error("Missing .env.local");
  }

  const env = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function getArgs(argv) {
  return {
    promote: argv.includes("--promote"),
    dryRun: argv.includes("--dry-run"),
  };
}

async function fetchSheetCsv(sheetId, gid) {
  const urls = [
    gid && gid !== "0"
      ? `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
      : null,
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`,
  ].filter(Boolean);

  let lastStatus = 0;
  for (const url of urls) {
    const response = await fetch(url);
    if (response.ok) {
      return response.text();
    }
    lastStatus = response.status;
  }

  throw new Error(
    `Failed to download sheet CSV (${lastStatus}). Confirm the sheet is shared as "Anyone with the link".`,
  );
}

function chunk(items, size) {
  const groups = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  return groups;
}

function dedupeOffers(rows) {
  const byId = new Map();

  for (const row of rows) {
    const existing = byId.get(row.id);
    if (!existing) {
      byId.set(row.id, row);
      continue;
    }

    const score = (offer) =>
      (offer.status === "published" ? 4 : 0) +
      (offer.eligible_days?.length ? 2 : 0) +
      (offer.eligible_hours && offer.eligible_hours !== "See offer details"
        ? 1
        : 0) +
      (offer.offer_summary?.length ?? 0) / 100;

    if (score(row) >= score(existing)) {
      byId.set(row.id, row);
    }
  }

  return [...byId.values()];
}

async function main() {
  const { promote, dryRun } = getArgs(process.argv.slice(2));
  const env = loadEnvLocal();

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const sheetId = env.RESTAURANT_OFFERS_SHEET_ID || DEFAULT_SHEET_ID;
  const gid = env.RESTAURANT_OFFERS_SHEET_GID || DEFAULT_GID;

  console.log(`Downloading sheet ${sheetId} (gid=${gid})...`);
  const csv = await fetchSheetCsv(sheetId, gid);
  const rows = parseCsv(csv);
  console.log(`Parsed ${rows.length} sheet rows`);

  const normalized = rows.map((row) => normalizeSheetRow(row));
  const stagingRows = normalized
    .map((item) => item.staging)
    .filter((row) => row.restaurant_name && row.row_hash)
    .map((row) => ({
      ...row,
      updated_at: new Date().toISOString(),
    }));

  console.log(`Staging candidates: ${stagingRows.length}`);

  if (dryRun) {
    const publishable = normalized.filter(
      (item) => item.offer?.status === "published",
    );
    const draft = normalized.filter((item) => item.offer?.status === "draft");
    console.log(
      `[dry-run] Would upsert ${stagingRows.length} staging rows` +
        (promote
          ? `; promote ${publishable.length} published + ${draft.length} draft offers`
          : " (promotion skipped)"),
    );
    console.log("Sample published offers:");
    for (const item of publishable.slice(0, 10)) {
      console.log(
        `  - ${item.offer.neighborhood} | ${item.offer.restaurant_name} | ${item.offer.eligible_days.join(", ")} | ${item.offer.eligible_hours}`,
      );
    }
    return;
  }

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let stagingUpserted = 0;
  for (const group of chunk(stagingRows, 100)) {
    const { error, data } = await supabase
      .from("staging_restaurant_offers")
      .upsert(group, { onConflict: "row_hash" })
      .select("id, row_hash");

    if (error) {
      throw new Error(`Staging upsert failed: ${error.message}`);
    }
    stagingUpserted += data?.length ?? group.length;
  }
  console.log(`Upserted ${stagingUpserted} staging rows`);

  if (!promote) {
    console.log("Done. Re-run with --promote to write normalized offers.");
    return;
  }

  const { data: stagingRecords, error: stagingReadError } = await supabase
    .from("staging_restaurant_offers")
    .select("id, row_hash");

  if (stagingReadError) {
    throw new Error(`Failed to read staging ids: ${stagingReadError.message}`);
  }

  const stagingIdByHash = new Map(
    (stagingRecords ?? []).map((record) => [record.row_hash, record.id]),
  );

  const offerRows = dedupeOffers(
    normalized
      .filter((item) => item.offer)
      .map((item) => ({
        ...item.offer,
        staging_id: stagingIdByHash.get(item.staging.row_hash) ?? null,
      })),
  );

  console.log(
    `Promoting ${offerRows.length} unique offers (duplicates collapsed)`,
  );

  let offersUpserted = 0;
  for (const group of chunk(offerRows, 100)) {
    const { error, data } = await supabase
      .from("restaurant_offers")
      .upsert(group, { onConflict: "id" })
      .select("id, status");

    if (error) {
      throw new Error(`Restaurant offers upsert failed: ${error.message}`);
    }
    offersUpserted += data?.length ?? group.length;
  }

  const published = offerRows.filter((row) => row.status === "published").length;
  const draft = offerRows.filter((row) => row.status === "draft").length;
  console.log(
    `Upserted ${offersUpserted} offers (${published} published, ${draft} draft)`,
  );
  console.log("Done.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
