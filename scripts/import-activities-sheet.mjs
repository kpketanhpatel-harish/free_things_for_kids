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
import { parseCsv } from "./lib/csv.mjs";
import { loadEnv } from "./lib/env.mjs";
import { normalizeSheetRow } from "./lib/normalizeActivity.mjs";
import { promoteActivities } from "./lib/promoteActivities.mjs";

const DEFAULT_SHEET_ID = "1ofdBQ8tdmUH_1Bs3DHxHJN-nZ8YuPD9vmgUV1v5RrH8";
const DEFAULT_GID = "1481875881";

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

async function main() {
  const { promote, dryRun } = getArgs(process.argv.slice(2));
  const env = loadEnv();

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const sheetId = env.ACTIVITIES_SHEET_ID || DEFAULT_SHEET_ID;
  const gid = env.ACTIVITIES_SHEET_GID || DEFAULT_GID;

  console.log(`Downloading sheet ${sheetId} (gid=${gid})...`);
  const csv = await fetchSheetCsv(sheetId, gid);
  const rows = parseCsv(csv);
  console.log(`Parsed ${rows.length} sheet rows`);

  const normalized = rows.map((row) => normalizeSheetRow(row));

  if (dryRun) {
    await promoteActivities({
      supabase: null,
      normalized,
      promote,
      dryRun: true,
    });
    return;
  }

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local or the environment",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await promoteActivities({
    supabase,
    normalized,
    promote,
    dryRun: false,
  });
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
