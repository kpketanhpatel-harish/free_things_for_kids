/**
 * Import chicago_family_events_combined Google Sheet → staging_activities,
 * then optionally promote normalized rows into activities.
 *
 * Prerequisites:
 * 1. Run supabase/staging_activities.sql
 * 2. Run supabase/activities_schema_updates.sql
 * 3. Add SUPABASE_SERVICE_ROLE_KEY to .env.local
 *
 * Usage:
 *   npm run import:activities
 *   npm run import:activities -- --promote
 *   npm run import:activities -- --promote --dry-run
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { parseCsv } from "./lib/csv.mjs";
import { normalizeSheetRow } from "./lib/normalizeActivity.mjs";

const DEFAULT_SHEET_ID = "1ofdBQ8tdmUH_1Bs3DHxHJN-nZ8YuPD9vmgUV1v5RrH8";
const DEFAULT_GID = "1481875881";

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
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to download sheet CSV (${response.status}). Confirm the sheet is shared as "Anyone with the link".`,
    );
  }
  return response.text();
}

function chunk(items, size) {
  const groups = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  return groups;
}

async function main() {
  const { promote, dryRun } = getArgs(process.argv.slice(2));
  const env = loadEnvLocal();

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const sheetId = env.ACTIVITIES_SHEET_ID || DEFAULT_SHEET_ID;
  const gid = env.ACTIVITIES_SHEET_GID || DEFAULT_GID;

  console.log(`Downloading sheet ${sheetId} (gid=${gid})...`);
  const csv = await fetchSheetCsv(sheetId, gid);
  const rows = parseCsv(csv);
  console.log(`Parsed ${rows.length} sheet rows`);

  const normalized = rows.map((row) => normalizeSheetRow(row));
  const stagingRows = normalized
    .map((item) => item.staging)
    .filter((row) => row.event_name && row.row_hash)
    .map((row) => ({
      ...row,
      updated_at: new Date().toISOString(),
    }));

  console.log(`Staging candidates: ${stagingRows.length}`);

  if (dryRun) {
    const publishable = normalized.filter(
      (item) => item.activity?.status === "published",
    ).length;
    const draft = normalized.filter(
      (item) => item.activity?.status === "draft",
    ).length;
    console.log(
      `[dry-run] Would upsert ${stagingRows.length} staging rows` +
        (promote
          ? `; promote ${publishable} published + ${draft} draft activities`
          : " (promotion skipped)"),
    );
    console.log("Sample published titles:");
    for (const item of normalized
      .filter((entry) => entry.activity?.status === "published")
      .slice(0, 8)) {
      console.log(
        `  - ${item.activity.date} | ${item.activity.neighborhood} | ${item.activity.title}`,
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
      .from("staging_activities")
      .upsert(group, { onConflict: "row_hash" })
      .select("id, row_hash");

    if (error) {
      throw new Error(`Staging upsert failed: ${error.message}`);
    }
    stagingUpserted += data?.length ?? group.length;
  }
  console.log(`Upserted ${stagingUpserted} staging rows`);

  if (!promote) {
    console.log("Done. Re-run with --promote to write normalized activities.");
    return;
  }

  const { data: stagingRecords, error: stagingReadError } = await supabase
    .from("staging_activities")
    .select("id, row_hash");

  if (stagingReadError) {
    throw new Error(`Failed to read staging ids: ${stagingReadError.message}`);
  }

  const stagingIdByHash = new Map(
    (stagingRecords ?? []).map((record) => [record.row_hash, record.id]),
  );

  const activityRows = normalized
    .filter((item) => item.activity)
    .map((item) => ({
      ...item.activity,
      staging_id: stagingIdByHash.get(item.staging.row_hash) ?? null,
    }));

  let activitiesUpserted = 0;
  for (const group of chunk(activityRows, 100)) {
    const { error, data } = await supabase
      .from("activities")
      .upsert(group, { onConflict: "id" })
      .select("id, status");

    if (error) {
      throw new Error(`Activities upsert failed: ${error.message}`);
    }
    activitiesUpserted += data?.length ?? group.length;
  }

  const published = activityRows.filter((row) => row.status === "published").length;
  const draft = activityRows.filter((row) => row.status === "draft").length;
  console.log(
    `Upserted ${activitiesUpserted} activities (${published} published, ${draft} draft)`,
  );
  console.log("Done.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
