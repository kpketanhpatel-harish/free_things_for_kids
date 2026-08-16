/**
 * Draft published activities that collide with a better copy of the same event
 * (same date + fingerprint). Prefers cpl:/cpd:/local: ids over sheet hashes.
 * Does not delete rows.
 *
 *   node scripts/cleanup-duplicate-activities.mjs --dry-run
 *   node scripts/cleanup-duplicate-activities.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./lib/env.mjs";
import { collidingActivityIds } from "./lib/dedupeByEvent.mjs";
import { draftCollidingPublishedActivities } from "./lib/promoteActivities.mjs";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  loadEnv();

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

  if (dryRun) {
    const { data, error } = await supabase
      .from("activities")
      .select(
        "id, title, date, venue, start_time, address, neighborhood, status",
      )
      .eq("status", "published");

    if (error) {
      throw new Error(`Failed to read activities: ${error.message}`);
    }

    const loserIds = collidingActivityIds(data ?? []);
    const losers = (data ?? []).filter((row) => loserIds.includes(row.id));
    console.log(`[dry-run] Would draft ${losers.length} duplicate activities:`);
    for (const row of losers.slice(0, 20)) {
      console.log(`  - ${row.date} | ${row.title} | ${row.id}`);
    }
    return;
  }

  const { drafted, loserIds } = await draftCollidingPublishedActivities(
    supabase,
  );
  console.log(`Drafted ${drafted} duplicate activities.`);
  for (const id of loserIds.slice(0, 20)) {
    console.log(`  - ${id}`);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
