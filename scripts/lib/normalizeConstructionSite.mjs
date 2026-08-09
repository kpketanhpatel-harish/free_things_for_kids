import { createHash } from "node:crypto";

export const TARGET_NEIGHBORHOODS = [
  "Lakeview",
  "Roscoe Village",
  "Lincoln Park",
];

const NEIGHBORHOOD_ALIASES = {
  lakeview: "Lakeview",
  "lake view": "Lakeview",
  "roscoe village": "Roscoe Village",
  "lincoln park": "Lincoln Park",
};

function clean(value) {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  return trimmed;
}

function col(row, ...candidates) {
  for (const name of candidates) {
    if (row[name] != null && String(row[name]).trim() !== "") {
      return clean(row[name]);
    }
  }

  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const needle = candidate.toLowerCase();
    const match = keys.find((key) => key.toLowerCase().includes(needle));
    if (match && String(row[match]).trim() !== "") {
      return clean(row[match]);
    }
  }

  return null;
}

function parseNumber(value) {
  const cleaned = clean(value);
  if (!cleaned) return null;
  const match = cleaned.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const num = Number(match[0]);
  return Number.isFinite(num) ? num : null;
}

function parseInteger(value) {
  const num = parseNumber(value);
  return num == null ? null : Math.round(num);
}

function parseDate(value) {
  const cleaned = clean(value);
  if (!cleaned) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;

  const parsed = new Date(cleaned);
  if (Number.isNaN(parsed.getTime())) return null;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function firstUrl(value) {
  const cleaned = clean(value);
  if (!cleaned) return null;
  const match = cleaned.match(/https?:\/\/[^\s,;]+/i);
  return match ? match[0].replace(/[).,]+$/, "") : cleaned.split(/[\s,;]+/)[0];
}

export function inferNeighborhood(neighborhoodRaw) {
  const normalized = clean(neighborhoodRaw)?.toLowerCase();
  if (!normalized) return null;

  for (const [alias, neighborhood] of Object.entries(NEIGHBORHOOD_ALIASES)) {
    if (normalized === alias || normalized.includes(alias)) {
      return neighborhood;
    }
  }

  return clean(neighborhoodRaw);
}

export function rowHash(siteId, siteName, address) {
  return createHash("sha256")
    .update([siteId ?? "", siteName ?? "", address ?? ""].join("|"))
    .digest("hex")
    .slice(0, 32);
}

export function constructionIdFromSiteId(siteId, siteName = "") {
  const basis = `${siteId ?? ""}|${siteName ?? ""}`;
  return createHash("sha256").update(basis).digest("hex").slice(0, 16);
}

/**
 * @returns {{ staging: object, site: object | null }}
 */
export function normalizeSheetRow(row) {
  const siteId = col(row, "Site ID");
  const siteName = col(row, "Site name");
  const address = col(row, "Address / limits");
  const neighborhoodRaw = col(row, "Neighborhood / suburb");
  const latitude = col(row, "Latitude");
  const longitude = col(row, "Longitude");
  const projectType = col(row, "Project type");
  const likelyMachinery = col(row, "Likely machinery");
  const evidenceClass = col(row, "Activity evidence class");
  const activityStatus = col(row, "Current activity / status");
  const activeStart = col(row, "Estimated active start");
  const activeEnd = col(row, "Estimated active end");
  const dateBasis = col(row, "Date basis");
  const viewingSuitability = col(
    row,
    "Viewing suitability / safe public vantage",
  );
  const viewingScore = col(row, "Viewing suitability score");
  const kidInterestScore = col(row, "Kid-interest score");
  const confidenceScore = col(row, "Confidence score");
  const permitIds = col(row, "Permit / project IDs");
  const sourceUrls = col(row, "Source URLs");
  const sourceRecordDate = col(row, "Source record / publication date");
  const lastChecked = col(row, "Last checked");
  const workDescription = col(row, "Work description / scope");
  const contractor = col(row, "Contractor / agency");
  const notes = col(row, "Notes");

  const hash = rowHash(siteId, siteName, address);

  const staging = {
    site_id: siteId,
    site_name: siteName,
    address_limits: address,
    neighborhood_raw: neighborhoodRaw,
    latitude,
    longitude,
    project_type: projectType,
    likely_machinery: likelyMachinery,
    activity_evidence_class: evidenceClass,
    current_activity_status: activityStatus,
    estimated_active_start: activeStart,
    estimated_active_end: activeEnd,
    date_basis: dateBasis,
    viewing_suitability: viewingSuitability,
    viewing_suitability_score: viewingScore,
    kid_interest_score: kidInterestScore,
    confidence_score: confidenceScore,
    permit_project_ids: permitIds,
    source_urls: sourceUrls,
    source_record_date: sourceRecordDate,
    last_checked: lastChecked,
    work_description: workDescription,
    contractor_agency: contractor,
    notes,
    source_sheet: "chicago_construction_watch_sites",
    row_hash: hash,
    raw: row,
  };

  if (!siteId || !siteName) {
    return { staging, site: null };
  }

  const neighborhood = inferNeighborhood(neighborhoodRaw);
  const inTarget =
    neighborhood != null && TARGET_NEIGHBORHOODS.includes(neighborhood);

  const summary =
    activityStatus ||
    workDescription ||
    (projectType && likelyMachinery
      ? `${projectType}. Likely machinery: ${likelyMachinery}.`
      : projectType);

  const site = {
    id: constructionIdFromSiteId(siteId, siteName),
    site_id: siteId,
    title: siteName,
    summary,
    address,
    neighborhood,
    latitude: parseNumber(latitude),
    longitude: parseNumber(longitude),
    project_type: projectType,
    likely_machinery: likelyMachinery,
    activity_status: activityStatus,
    evidence_class: evidenceClass,
    active_start: parseDate(activeStart),
    active_end: parseDate(activeEnd),
    viewing_suitability: viewingSuitability,
    viewing_suitability_score: parseInteger(viewingScore),
    kid_interest_score: parseInteger(kidInterestScore),
    confidence_score: parseInteger(confidenceScore),
    permit_project_ids: permitIds,
    source_url: firstUrl(sourceUrls) ?? "https://docs.google.com/spreadsheets/d/1wYDscLNSOgx58DkPafWqRN2m3HzqIrJevJFXOOdXgt0",
    source_record_date: parseDate(sourceRecordDate),
    last_checked: parseDate(lastChecked),
    work_description: workDescription,
    contractor_agency: contractor,
    notes,
    status: inTarget ? "published" : "draft",
    source_name: "chicago_construction_watch_sites",
  };

  return { staging, site };
}
