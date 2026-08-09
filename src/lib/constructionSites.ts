import { createClient } from "@/lib/supabase/server";
import type { ConstructionSite } from "@/types";

export const PRIORITY_NEIGHBORHOODS = [
  "Roscoe Village",
  "Lakeview",
  "Lincoln Park",
] as const;

type ConstructionSiteRow = {
  id: string;
  site_id: string;
  title: string;
  summary: string | null;
  address: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  project_type: string | null;
  likely_machinery: string | null;
  activity_status: string | null;
  evidence_class: string | null;
  active_start: string | null;
  active_end: string | null;
  viewing_suitability: string | null;
  viewing_suitability_score: number | null;
  kid_interest_score: number | null;
  confidence_score: number | null;
  permit_project_ids: string | null;
  source_url: string | null;
  source_record_date: string | null;
  last_checked: string | null;
  work_description: string | null;
  contractor_agency: string | null;
  notes: string | null;
};

function mapConstructionSite(row: ConstructionSiteRow): ConstructionSite {
  return {
    id: row.id,
    siteId: row.site_id,
    title: row.title,
    summary: row.summary ?? undefined,
    address: row.address ?? undefined,
    neighborhood: row.neighborhood ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    projectType: row.project_type ?? undefined,
    likelyMachinery: row.likely_machinery ?? undefined,
    activityStatus: row.activity_status ?? undefined,
    evidenceClass: row.evidence_class ?? undefined,
    activeStart: row.active_start ?? undefined,
    activeEnd: row.active_end ?? undefined,
    viewingSuitability: row.viewing_suitability ?? undefined,
    viewingSuitabilityScore: row.viewing_suitability_score ?? undefined,
    kidInterestScore: row.kid_interest_score ?? undefined,
    confidenceScore: row.confidence_score ?? undefined,
    permitProjectIds: row.permit_project_ids ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    sourceRecordDate: row.source_record_date ?? undefined,
    lastChecked: row.last_checked ?? undefined,
    workDescription: row.work_description ?? undefined,
    contractorAgency: row.contractor_agency ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function isPriorityNeighborhood(neighborhood?: string): boolean {
  if (!neighborhood) return false;
  const normalized = neighborhood.toLowerCase();
  return PRIORITY_NEIGHBORHOODS.some(
    (name) =>
      normalized === name.toLowerCase() ||
      normalized.includes(name.toLowerCase()) ||
      (name === "Lakeview" && normalized.includes("lake view")),
  );
}

function sortConstructionSites(sites: ConstructionSite[]): ConstructionSite[] {
  return [...sites].sort((a, b) => {
    const aPriority = isPriorityNeighborhood(a.neighborhood) ? 0 : 1;
    const bPriority = isPriorityNeighborhood(b.neighborhood) ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;

    const kidDiff = (b.kidInterestScore ?? 0) - (a.kidInterestScore ?? 0);
    if (kidDiff !== 0) return kidDiff;

    const confidenceDiff = (b.confidenceScore ?? 0) - (a.confidenceScore ?? 0);
    if (confidenceDiff !== 0) return confidenceDiff;

    return a.title.localeCompare(b.title);
  });
}

export function partitionConstructionSites(sites: ConstructionSite[]): {
  priority: ConstructionSite[];
  other: ConstructionSite[];
} {
  const priority: ConstructionSite[] = [];
  const other: ConstructionSite[] = [];

  for (const site of sites) {
    if (isPriorityNeighborhood(site.neighborhood)) {
      priority.push(site);
    } else {
      other.push(site);
    }
  }

  return { priority, other };
}

export async function getConstructionSites(): Promise<ConstructionSite[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("construction_sites")
    .select(
      "id, site_id, title, summary, address, neighborhood, latitude, longitude, project_type, likely_machinery, activity_status, evidence_class, active_start, active_end, viewing_suitability, viewing_suitability_score, kid_interest_score, confidence_score, permit_project_ids, source_url, source_record_date, last_checked, work_description, contractor_agency, notes",
    );

  if (error) {
    throw new Error(`Failed to load construction sites: ${error.message}`);
  }

  return sortConstructionSites(
    (data ?? []).map((row) => mapConstructionSite(row as ConstructionSiteRow)),
  );
}

export async function getConstructionSiteById(
  id: string,
): Promise<ConstructionSite | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("construction_sites")
    .select(
      "id, site_id, title, summary, address, neighborhood, latitude, longitude, project_type, likely_machinery, activity_status, evidence_class, active_start, active_end, viewing_suitability, viewing_suitability_score, kid_interest_score, confidence_score, permit_project_ids, source_url, source_record_date, last_checked, work_description, contractor_agency, notes",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load construction site: ${error.message}`);
  }

  if (!data) return null;
  return mapConstructionSite(data as ConstructionSiteRow);
}
