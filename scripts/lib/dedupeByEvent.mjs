export function fingerprint(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/@/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isIngestId(id) {
  return /^(cpl|cpd|local):/.test(id ?? "");
}

export function activityDedupeKey(activity) {
  const title = fingerprint(activity?.title);
  const date = activity?.date ?? "";
  if (/\b(market|fest|festival|carnival|farmers)\b/.test(title)) {
    return `${date}|${title}`;
  }
  return `${date}|${title}|${fingerprint(activity?.venue)}`;
}

export function activityDedupeScore(activity) {
  const start = activity?.startTime ?? activity?.start_time;
  return (
    (isIngestId(activity?.id) ? 8 : 0) +
    (activity?.status === "published" ? 4 : 0) +
    (start ? 2 : 0) +
    (activity?.address ? 1 : 0) +
    (activity?.neighborhood ? 1 : 0)
  );
}

/** Keep one row per date + event fingerprint. Prefer ingest ids over sheet hashes. */
export function dedupeActivitiesByEvent(rows) {
  const byKey = new Map();

  for (const row of rows ?? []) {
    const key = activityDedupeKey(row);
    const existing = byKey.get(key);
    if (!existing || activityDedupeScore(row) >= activityDedupeScore(existing)) {
      byKey.set(key, row);
    }
  }

  return [...byKey.values()];
}

export function collidingActivityIds(rows) {
  const winners = new Set(dedupeActivitiesByEvent(rows).map((row) => row.id));
  return (rows ?? [])
    .map((row) => row.id)
    .filter((id) => id && !winners.has(id));
}
