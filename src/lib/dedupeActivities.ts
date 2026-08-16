import type { Activity } from "@/types";

export function fingerprint(value: string | null | undefined): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/@/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isIngestId(id: string): boolean {
  return /^(cpl|cpd|local):/.test(id);
}

export function activityDedupeKey(activity: Pick<Activity, "date" | "title" | "venue">): string {
  const title = fingerprint(activity.title);
  const date = activity.date ?? "";
  if (/\b(market|fest|festival|carnival|farmers)\b/.test(title)) {
    return `${date}|${title}`;
  }
  return `${date}|${title}|${fingerprint(activity.venue)}`;
}

function score(activity: Activity): number {
  return (
    (isIngestId(activity.id) ? 8 : 0) +
    (activity.startTime ? 2 : 0) +
    (activity.address ? 1 : 0) +
    (activity.neighborhood ? 1 : 0)
  );
}

/** Keep one published card per date + event fingerprint. Prefer ingest ids. */
export function dedupeActivitiesByEvent(rows: Activity[]): Activity[] {
  const byKey = new Map<string, Activity>();

  for (const row of rows) {
    const key = activityDedupeKey(row);
    const existing = byKey.get(key);
    if (!existing || score(row) >= score(existing)) {
      byKey.set(key, row);
    }
  }

  return [...byKey.values()];
}
