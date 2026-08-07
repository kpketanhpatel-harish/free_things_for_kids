import { createClient } from "@/lib/supabase/server";
import type { Activity } from "@/types";

type ActivityRow = {
  id: string;
  title: string;
  summary: string;
  icon: string;
  date: string;
  start_time: string;
  end_time: string | null;
  venue: string;
  address: string;
  neighborhood: string;
  age_group: string;
  registration_required: boolean;
  source_url: string;
};

function mapActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    icon: row.icon,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time ?? undefined,
    venue: row.venue,
    address: row.address,
    neighborhood: row.neighborhood,
    ageGroup: row.age_group,
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

  return (data ?? []).map((row) => mapActivity(row as ActivityRow));
}

export async function getActivityById(id: string): Promise<Activity | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activities")
    .select(
      "id, title, summary, icon, date, start_time, end_time, venue, address, neighborhood, age_group, registration_required, source_url",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load activity: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapActivity(data as ActivityRow);
}
