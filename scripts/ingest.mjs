/**
 * Ingest adapters into staging_activities / activities.
 *
 * Usage:
 *   node scripts/ingest.mjs --source cpl --dry-run
 *   node scripts/ingest.mjs --source cpd --dry-run
 *   node scripts/ingest.mjs --source local --dry-run
 *   node scripts/ingest.mjs --source local --promote
 */

import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./lib/env.mjs";
import { normalizeCplEvent } from "./lib/normalizeCplEvent.mjs";
import { normalizeCpdActivity } from "./lib/normalizeCpdActivity.mjs";
import { promoteActivities } from "./lib/promoteActivities.mjs";
import { fetchCplEvents } from "./sources/cpl.mjs";
import { fetchCpdActivities } from "./sources/cpd.mjs";
import { loadLocalActivities } from "./sources/local.mjs";

const SOURCES = {
  cpl: {
    description: "Chicago Public Library events (Merlo, Lincoln Belmont, Lincoln Park)",
    async load() {
      const events = await fetchCplEvents({
        appToken: process.env.SOCRATA_APP_TOKEN,
      });
      console.log(`Fetched ${events.length} CPL events`);
      return events.map((event) => normalizeCplEvent(event));
    },
  },
  cpd: {
    description:
      "Chicago Park District free events (Wrightwood, Hamlin, Trebes, Gill, Donahue)",
    async load() {
      const rows = await fetchCpdActivities({
        appToken: process.env.SOCRATA_APP_TOKEN,
      });
      console.log(`Fetched ${rows.length} Park District rows`);
      return rows.map((row) => normalizeCpdActivity(row));
    },
  },
  local: {
    description:
      "Lakeview/Roscoe Village calendar plus neighborhood markets, bookstores, and Taste of Lincoln",
    async load() {
      const normalized = await loadLocalActivities();
      console.log(`Built ${normalized.length} local source rows`);
      return normalized;
    },
  },
};

function getArgs(argv) {
  const sourceIndex = argv.indexOf("--source");
  const source = sourceIndex === -1 ? null : argv[sourceIndex + 1];
  return {
    source,
    promote: argv.includes("--promote"),
    dryRun: argv.includes("--dry-run"),
  };
}

async function main() {
  const { source, promote, dryRun } = getArgs(process.argv.slice(2));
  loadEnv();

  if (!source || !SOURCES[source]) {
    const available = Object.keys(SOURCES).join(", ");
    throw new Error(
      `Pass --source <name>. Available: ${available}`,
    );
  }

  console.log(`Ingesting source: ${source} (${SOURCES[source].description})`);
  const normalized = await SOURCES[source].load();

  if (dryRun) {
    await promoteActivities({
      supabase: null,
      normalized,
      promote,
      dryRun: true,
    });
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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
