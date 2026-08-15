export function chunk(items, size) {
  const groups = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, size + i));
  }
  return groups;
}

/** Prefer published + richer rows when a batch has duplicate identities. */
export function dedupeActivities(rows) {
  const byId = new Map();

  for (const row of rows) {
    const existing = byId.get(row.id);
    if (!existing) {
      byId.set(row.id, row);
      continue;
    }

    const score = (activity) =>
      (activity.status === "published" ? 4 : 0) +
      (activity.start_time ? 2 : 0) +
      (activity.address ? 1 : 0) +
      (activity.neighborhood ? 1 : 0);

    if (score(row) >= score(existing)) {
      byId.set(row.id, row);
    }
  }

  return [...byId.values()];
}

export function summarizeNormalized(normalized) {
  const skipCounts = {};
  let publishable = 0;
  let draft = 0;

  for (const item of normalized) {
    if (item.skipReason) {
      skipCounts[item.skipReason] = (skipCounts[item.skipReason] ?? 0) + 1;
      continue;
    }
    if (item.activity?.status === "published") publishable += 1;
    else if (item.activity?.status === "draft") draft += 1;
  }

  return { publishable, draft, skipCounts };
}

export async function promoteActivities({
  supabase,
  normalized,
  promote,
  dryRun,
}) {
  const stagingRows = normalized
    .filter((item) => !item.skipReason)
    .map((item) => item.staging)
    .filter((row) => row.event_name && row.row_hash)
    .map((row) => ({
      ...row,
      updated_at: new Date().toISOString(),
    }));

  const { publishable, draft, skipCounts } = summarizeNormalized(normalized);
  const skipSummary = Object.entries(skipCounts)
    .map(([reason, count]) => `${reason}=${count}`)
    .join(", ");

  console.log(`Staging candidates: ${stagingRows.length}`);
  if (skipSummary) {
    console.log(`Skipped: ${skipSummary}`);
  }

  if (dryRun) {
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
    return { stagingRows, publishable, draft };
  }

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
    return { stagingRows, publishable, draft };
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

  const activityRows = dedupeActivities(
    normalized
      .filter((item) => item.activity)
      .map((item) => ({
        ...item.activity,
        staging_id: stagingIdByHash.get(item.staging.row_hash) ?? null,
      })),
  );

  console.log(
    `Promoting ${activityRows.length} unique activities (duplicates collapsed)`,
  );

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

  console.log(
    `Upserted ${activitiesUpserted} activities (${publishable} published, ${draft} draft)`,
  );
  console.log("Done.");
  return { stagingRows, publishable, draft };
}
