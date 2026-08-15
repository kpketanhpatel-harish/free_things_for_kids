import { createHash } from "node:crypto";

export const TARGET_NEIGHBORHOODS = [
  "Lakeview",
  "Roscoe Village",
  "Lincoln Park",
];

const VENUE_NEIGHBORHOODS = {
  merlo: "Lakeview",
  "lincoln belmont": "Lakeview",
  "lincoln park": "Lincoln Park",
  "hamlin park": "Roscoe Village",
  "hamlin (hannibal) park": "Roscoe Village",
  "gill (joseph) park": "Lakeview",
  "gill park": "Lakeview",
  "trebes (robert) park": "Lincoln Park",
  "trebes park": "Lincoln Park",
  "green city market lincoln park": "Lincoln Park",
  "lincoln park farmers market": "Lincoln Park",
  "taste of lincoln avenue": "Lincoln Park",
  "roscoe village farmers market": "Roscoe Village",
  "lowline market": "Lakeview",
  "lowline plaza": "Lakeview",
  "bitterpops": "Lakeview",
  itoko: "Lakeview",
};

const NEIGHBORHOOD_ALIASES = {
  lakeview: "Lakeview",
  "lake view": "Lakeview",
  wrigleyville: "Lakeview",
  "wrigley ville": "Lakeview",
  "roscoe village": "Roscoe Village",
  "lincoln park": "Lincoln Park",
};

export function clean(value) {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed || /^not stated$/i.test(trimmed)) return null;
  return trimmed;
}

export function rowHash(eventLink, dateRaw, eventName) {
  return createHash("sha256")
    .update([eventLink ?? "", dateRaw ?? "", eventName ?? ""].join("|"))
    .digest("hex")
    .slice(0, 32);
}

export function activityIdFromLink(eventLink, dateRaw, eventName = "") {
  const basis = `${eventLink ?? ""}|${dateRaw ?? ""}|${eventName ?? ""}`;
  return createHash("sha256").update(basis).digest("hex").slice(0, 16);
}

function matchNeighborhood(text) {
  const normalized = clean(text)?.toLowerCase();
  if (!normalized) return null;

  for (const [alias, neighborhood] of Object.entries(NEIGHBORHOOD_ALIASES)) {
    if (normalized === alias || normalized.includes(alias)) {
      return neighborhood;
    }
  }

  for (const [venueKey, neighborhood] of Object.entries(VENUE_NEIGHBORHOODS)) {
    if (normalized.includes(venueKey)) {
      return neighborhood;
    }
  }

  return null;
}

export function inferNeighborhood(libraryName, location) {
  return (
    matchNeighborhood(libraryName) ||
    matchNeighborhood(location) ||
    null
  );
}

export function parseTimeRange(timeRaw) {
  const value = clean(timeRaw);
  if (!value) return { startTime: null, endTime: null };

  // "During fieldhouse hours" and similar free text
  if (!/\d/.test(value)) {
    return { startTime: null, endTime: null, timeNote: value };
  }

  const parts = value.split(/[–—-]/).map((part) => part.trim());
  const startTime = toTwentyFourHour(parts[0]);
  const endTime = parts[1] ? toTwentyFourHour(parts[1]) : null;

  return { startTime, endTime };
}

function toTwentyFourHour(timeText) {
  const match = timeText
    .replace(/\s+/g, "")
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = match[2] ? Number(match[2]) : 0;
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  if (!meridiem && hours > 23) return null;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function parseRegistrationRequired(raw) {
  const value = clean(raw)?.toLowerCase();
  if (!value) return false;
  if (value === "yes" || value === "true" || value === "required") return true;
  return false;
}

export function pickIcon(eventName, ageRange) {
  const text = `${eventName ?? ""} ${ageRange ?? ""}`.toLowerCase();
  if (text.includes("story") || text.includes("rhyme") || text.includes("goose")) {
    return "📖";
  }
  if (text.includes("lego")) return "🧱";
  if (text.includes("music") || text.includes("concert") || text.includes("jazz")) {
    return "🎵";
  }
  if (text.includes("art") || text.includes("craft") || text.includes("canvas")) {
    return "🎨";
  }
  if (text.includes("market") || text.includes("farmers")) return "🥕";
  if (text.includes("movie") || text.includes("film") || text.includes("screen")) {
    return "🎬";
  }
  if (text.includes("play") || text.includes("tummy") || text.includes("sensory")) {
    return "🤲";
  }
  return "✨";
}

export function buildSummary(notes, ageRange) {
  const note = clean(notes);
  if (note) {
    const withoutSourcePrefix = note.replace(/^Source:\s*/i, "");
    return withoutSourcePrefix.slice(0, 240);
  }
  if (clean(ageRange)) {
    return `Family activity for ${clean(ageRange)}.`;
  }
  return "See the event page for full details.";
}

export function extractSourceName(notes) {
  const note = clean(notes);
  if (!note) return null;
  const match = note.match(/Source:\s*([^;]+)/i);
  return match ? match[1].trim() : null;
}

export function extractEndDate(notes) {
  const note = clean(notes);
  if (!note) return null;
  const match = note.match(
    /(?:ends|through|runs through)\s+(\d{4}-\d{2}-\d{2})/i,
  );
  return match ? match[1] : null;
}

export function isTargetNeighborhood(neighborhood) {
  return TARGET_NEIGHBORHOODS.includes(neighborhood);
}

export function normalizeSheetRow(row) {
  const eventName = clean(row.event_name);
  const eventLink = clean(row.event_link);
  const dateRaw = clean(row.date);
  const libraryName = clean(row.library_name);
  const location = clean(row.location);
  const timeRaw = clean(row.time);
  const ageRange = clean(row.age_range);
  const registrationRequiredRaw = clean(row.registration_required);
  const registrationDate = clean(row.registration_date);
  const notes = clean(row.notes);

  const neighborhood = inferNeighborhood(libraryName, location);
  const { startTime, endTime } = parseTimeRange(timeRaw);

  return {
    staging: {
      event_name: eventName,
      library_name: libraryName,
      event_link: eventLink,
      location,
      time_raw: timeRaw,
      date_raw: dateRaw,
      age_range: ageRange,
      registration_required_raw: registrationRequiredRaw,
      registration_date: registrationDate,
      notes,
      row_hash: rowHash(eventLink, dateRaw, eventName),
      raw: row,
    },
    activity: eventName && eventLink && dateRaw
      ? {
          id: activityIdFromLink(eventLink, dateRaw, eventName),
          title: eventName,
          summary: buildSummary(notes, ageRange),
          icon: pickIcon(eventName, ageRange),
          date: dateRaw,
          start_time: startTime,
          end_time: endTime,
          venue: libraryName ?? location ?? "See event page",
          address: looksLikeAddress(location) ? location : libraryName,
          neighborhood,
          age_group: ageRange ?? "All ages",
          registration_required: parseRegistrationRequired(
            registrationRequiredRaw,
          ),
          source_url: eventLink,
          source_name: extractSourceName(notes),
          notes,
          end_date: extractEndDate(notes),
          status:
            neighborhood && isTargetNeighborhood(neighborhood)
              ? "published"
              : "draft",
        }
      : null,
  };
}

function looksLikeAddress(value) {
  if (!value) return false;
  return /\d/.test(value) && /(st|ave|rd|blvd|street|avenue|road|park)/i.test(value);
}
