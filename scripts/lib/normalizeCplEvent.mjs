import { createHash } from "node:crypto";
import {
  buildSummary,
  inferNeighborhood,
  isTargetNeighborhood,
  pickIcon,
} from "./normalizeActivity.mjs";

const KID_AUDIENCE_PATTERN =
  /\b(babies|toddlers|preschoolers|kids|tweens)\b/i;

const SKIP_EVENT_TYPES = /library closures/i;

function cleanText(value) {
  if (value == null) return null;
  const trimmed = String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
  return trimmed || null;
}

export function isKidAudience(eventAudiences) {
  return KID_AUDIENCE_PATTERN.test(eventAudiences ?? "");
}

export function formatAudiences(eventAudiences) {
  const raw = cleanText(eventAudiences);
  if (!raw) return null;

  const labels = raw.split("|").map((part) => {
    const trimmed = part.trim();
    const paren = trimmed.match(/\(([^)]+)\)/);
    return paren ? paren[1].trim() : trimmed;
  });

  return labels.filter(Boolean).join(", ") || null;
}

export function parseCplDateTime(value) {
  const raw = cleanText(value);
  if (!raw) return { date: null, time: null };

  const match = raw.match(
    /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}):(\d{2}))?/,
  );
  if (!match) return { date: null, time: null };

  return {
    date: match[1],
    time: match[2] != null ? `${match[2]}:${match[3]}` : null,
  };
}

export function eventPageUrl(event) {
  const url = event?.event_page?.url;
  if (typeof url === "string" && url.trim()) return url.trim();
  if (event?.event_id) {
    return `https://chipublib.bibliocommons.com/events/${event.event_id}`;
  }
  return null;
}

export function cplRowHash(eventId) {
  return createHash("sha256")
    .update(`cpl|${eventId ?? ""}`)
    .digest("hex")
    .slice(0, 32);
}

export function cplActivityId(eventId) {
  return `cpl:${eventId}`;
}

export function parseCplRegistration(status) {
  const value = cleanText(status)?.toUpperCase();
  if (!value || value === "NOT REQUIRED") return false;
  return true;
}

export function normalizeCplEvent(event) {
  const eventId = cleanText(event?.event_id);
  const title = cleanText(event?.title);
  const description = cleanText(event?.description);
  const locationName = cleanText(event?.location_name);
  const locationAddress = cleanText(event?.location_address);
  const locationZip = cleanText(event?.location_zip);
  const eventLink = eventPageUrl(event);
  const { date, time: startTime } = parseCplDateTime(event?.start);
  const { date: endDate, time: endTime } = parseCplDateTime(event?.end);
  const ageRange = formatAudiences(event?.event_audiences);
  const registrationRequired = parseCplRegistration(
    event?.registration_status,
  );

  const address = [locationAddress, locationZip].filter(Boolean).join(", ");
  const neighborhood = inferNeighborhood(locationName, address);
  const hash = cplRowHash(eventId);

  const staging = {
    event_name: title,
    library_name: locationName,
    event_link: eventLink,
    location: address || locationName,
    time_raw: [startTime, endTime].filter(Boolean).join("–") || null,
    date_raw: date,
    age_range: ageRange,
    registration_required_raw: event?.registration_status ?? null,
    registration_date: event?.registration_ends ?? null,
    notes: description,
    source_sheet: "cpl",
    row_hash: hash,
    raw: event,
  };

  if (event?.cancelled === true || event?.cancelled === "true") {
    return { staging, activity: null, skipReason: "cancelled" };
  }

  if (SKIP_EVENT_TYPES.test(event?.event_types ?? "")) {
    return { staging, activity: null, skipReason: "library-closure" };
  }

  if (!isKidAudience(event?.event_audiences)) {
    return { staging, activity: null, skipReason: "not-kid-audience" };
  }

  if (!eventId || !title || !eventLink || !date) {
    return { staging, activity: null, skipReason: "missing-required-fields" };
  }

  return {
    staging,
    skipReason: null,
    activity: {
      id: cplActivityId(eventId),
      title,
      summary: buildSummary(description, ageRange),
      icon: pickIcon(title, ageRange),
      date,
      start_time: startTime,
      end_time: endTime,
      venue: locationName ? `${locationName} Library` : "Chicago Public Library",
      address: address || locationName,
      neighborhood,
      age_group: ageRange ?? "All ages",
      registration_required: registrationRequired,
      source_url: eventLink,
      source_name: "Chicago Public Library",
      notes: description,
      end_date: endDate && endDate !== date ? endDate : null,
      status:
        neighborhood && isTargetNeighborhood(neighborhood)
          ? "published"
          : "draft",
    },
  };
}
