/**
 * Import Chicago Heavy-Machinery Construction Watch Sites Google Sheet
 * → staging_construction_sites, then optionally promote into construction_sites.
 *
 * Prerequisites:
 * 1. Run supabase/staging_construction_sites.sql
 * 2. Run supabase/construction_sites.sql
 * 3. Add SUPABASE_SERVICE_ROLE_KEY to .env.local
 *
 * Usage:
 *   npm run import:construction-sites
 *   npm run import:construction-sites -- --promote
 *   npm run import:construction-sites -- --promote --dry-run
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { parseCsv } from "./lib/csv.mjs";
import { normalizeSheetRow } from "./lib/normalizeConstructionSite.mjs";

const DEFAULT_SHEET_ID = "1wYDscLNSOgx58DkPafWqRN2m3HzqIrJevJFXOOdXgt0";
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

/** Sheet has intro rows above the real header starting with "Site ID". */
function stripPreamble(csvText) {
  const lines = csvText.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) =>
    /^"?Site ID"?,/i.test(line.trim()),
  );
  if (headerIndex === -1) {
    throw new Error('Could not find "Site ID" header row in sheet CSV.');
  }
  return lines.slice(headerIndex).join("\n");
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
  const sheetId = env.CONSTRUCTION_SHEET_ID || DEFAULT_SHEET_ID;
  const gid = env.CONSTRUCTION_SHEET_GID || DEFAULT_GID;

  console.log(`Downloading sheet ${sheetId} (gid=${gid})...`);
  const csv = stripPreamble(await fetchSheetCsv(sheetId, gid));
  const rows = parseCsv(csv);
  console.log(`Parsed ${rows.length} sheet rows`);

  const normalized = rows.map((row) => normalizeSheetRow(row));
  const stagingRows = normalized
    .map((item) => item.staging)
    .filter((row) => row.site_id && row.row_hash)
    .map((row) => ({
      ...row,
      updated_at: new Date().toISOString(),
    }));

  console.log(`Staging candidates: ${stagingRows.length}`);

  if (dryRun) {
    const publishable = normalized.filter(
      (item) => item.site?.status === "published",
    ).length;
    const draft = normalized.filter(
      (item) => item.site?.status === "draft",
    ).length;
    console.log(
      `[dry-run] Would upsert ${stagingRows.length} staging rows` +
        (promote
          ? `; promote ${publishable} published + ${draft} draft construction sites`
          : " (promotion skipped)"),
    );
    console.log("Sample published sites:");
    for (const item of normalized
      .filter((entry) => entry.site?.status === "published")
      .slice(0, 10)) {
      console.log(
        `  - ${item.site.site_id} | ${item.site.neighborhood} | ${item.site.title}`,
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
      .from("staging_construction_sites")
      .upsert(group, { onConflict: "row_hash" })
      .select("id, row_hash");

    if (error) {
      throw new Error(`Staging upsert failed: ${error.message}`);
    }
    stagingUpserted += data?.length ?? group.length;
  }
  console.log(`Upserted ${stagingUpserted} staging rows`);

  if (!promote) {
    console.log(
      "Done. Re-run with --promote to write normalized construction_sites.",
    );
    return;
  }

  const { data: stagingRecords, error: stagingReadError } = await supabase
    .from("staging_construction_sites")
    .select("id, row_hash");

  if (stagingReadError) {
    throw new Error(`Failed to read staging ids: ${stagingReadError.message}`);
  }

  const stagingIdByHash = new Map(
    (stagingRecords ?? []).map((record) => [record.row_hash, record.id]),
  );

  const siteRows = normalized
    .filter((item) => item.site)
    .map((item) => ({
      ...item.site,
      staging_id: stagingIdByHash.get(item.staging.row_hash) ?? null,
      updated_at: new Date().toISOString(),
    }));

  console.log(`Promoting ${siteRows.length} construction sites`);

  let sitesUpserted = 0;
  for (const group of chunk(siteRows, 100)) {
    const { error, data } = await supabase
      .from("construction_sites")
      .upsert(group, { onConflict: "id" })
      .select("id, status");

    if (error) {
      throw new Error(`Construction sites upsert failed: ${error.message}`);
    }
    sitesUpserted += data?.length ?? group.length;
  }

  const published = siteRows.filter((row) => row.status === "published").length;
  const draft = siteRows.filter((row) => row.status === "draft").length;
  console.log(
    `Upserted ${sitesUpserted} construction sites (${published} published, ${draft} draft)`,
  );
  console.log("Done.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
