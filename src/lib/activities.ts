import { decodeActivityId } from "@/lib/activityPath";
import { dedupeActivitiesByEvent } from "@/lib/dedupeActivities";
import { createClient } from "@/lib/supabase/server";
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
};

function mapActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary ?? "See the event page for full details.",
    icon: row.icon ?? "✨",
    date: row.date,
    startTime: row.start_time ?? undefined,
    endTime: row.end_time ?? undefined,
    venue: row.venue ?? "See event page",
    address: row.address ?? undefined,
    neighborhood: row.neighborhood ?? "Chicago",
    ageGroup: row.age_group ?? "All ages",
    registrationRequired: row.registration_required,
    sourceUrl: row.source_url,
  };
}

export async function getActivities(): Promise<Activity[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activities")
    .select(
      "id, title, summary, icon, date, start_time, end_time, venue, address, neighborhood, age_group, registration_required, source_url",
    )
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(`Failed to load activities: ${error.message}`);
  }

  return dedupeActivitiesByEvent(
    (data ?? []).map((row) => mapActivity(row as ActivityRow)),
  ).sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;
    return (a.startTime ?? "").localeCompare(b.startTime ?? "");
  });
}

export async function getActivityById(id: string): Promise<Activity | null> {
  const supabase = await createClient();
  const decodedId = decodeActivityId(id);

  const { data, error } = await supabase
    .from("activities")
    .select(
      "id, title, summary, icon, date, start_time, end_time, venue, address, neighborhood, age_group, registration_required, source_url",
    )
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
