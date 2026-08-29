import { decodeActivityId } from "@/lib/activityPath";
import { isFamilyDiscoveryActivity } from "@/lib/activityFacets";
import { chicagoTodayYmd, datesForIntent } from "@/lib/chicagoTime";
import { dedupeActivitiesByEvent } from "@/lib/dedupeActivities";
import { createClient } from "@/lib/supabase/server";
import { filterActiveActivities } from "@/lib/upcoming";
import type { Activity } from "@/types";

type ActivityRow = {
  id: string;
  title: string;
  summary: string | null;
  icon: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  address: string | null;
  neighborhood: string | null;
  age_group: string | null;
  registration_required: boolean;
  source_url: string;
  source_name?: string | null;
  created_at?: string | null;
};

function mapActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary ?? "See the event page for full details.",
    icon: row.icon ?? "✨",
    date: String(row.date).slice(0, 10),
    startTime: row.start_time ?? undefined,
    endTime: row.end_time ?? undefined,
    venue: row.venue ?? "See event page",
    address: row.address ?? undefined,
    neighborhood: row.neighborhood ?? "Chicago",
    ageGroup: row.age_group ?? "All ages",
    registrationRequired: row.registration_required,
    sourceUrl: row.source_url,
    sourceName: row.source_name ?? undefined,
    createdAt: row.created_at ?? undefined,
  };
}

const ACTIVITY_COLUMNS =
  "id, title, summary, icon, date, start_time, end_time, venue, address, neighborhood, age_group, registration_required, source_url, created_at";

function sortActivities(rows: Activity[]): Activity[] {
  return [...rows].sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;
    return (a.startTime ?? "").localeCompare(b.startTime ?? "");
  });
}

function mapAndDedupe(rows: ActivityRow[] | null): Activity[] {
  return sortActivities(
    dedupeActivitiesByEvent((rows ?? []).map((row) => mapActivity(row))),
  );
}

export async function getActivities(): Promise<Activity[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_COLUMNS)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(`Failed to load activities: ${error.message}`);
  }

  return mapAndDedupe(data as ActivityRow[] | null);
}

export async function getUpcomingPublishedActivities(
  now = new Date(),
): Promise<Activity[]> {
  const supabase = await createClient();
  const today = chicagoTodayYmd(now);

  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_COLUMNS)
    .gte("date", today)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(`Failed to load activities: ${error.message}`);
  }

  return filterActiveActivities(mapAndDedupe(data as ActivityRow[] | null), now).filter(
    isFamilyDiscoveryActivity,
  );
}

export async function getHomeDiscoveryActivities(
  now = new Date(),
): Promise<Activity[]> {
  const all = await getUpcomingPublishedActivities(now);
  const today = chicagoTodayYmd(now);
  const dates = new Set([
    ...datesForIntent("today", today),
    ...datesForIntent("tomorrow", today),
    ...datesForIntent("weekend", today),
  ]);
  return all.filter((activity) => dates.has(activity.date));
}

export async function getActivitiesInRange(
  startDate: string,
  endDate: string,
): Promise<Activity[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_COLUMNS)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(`Failed to load calendar activities: ${error.message}`);
  }

  return mapAndDedupe(data as ActivityRow[] | null);
}

export async function getActivityById(id: string): Promise<Activity | null> {
  const supabase = await createClient();
  const decodedId = decodeActivityId(id);

  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_COLUMNS)
    .eq("id", decodedId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load activity: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapActivity(data as ActivityRow);
}
