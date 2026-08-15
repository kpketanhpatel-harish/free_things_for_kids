import { createHash } from "node:crypto";
import {
  buildSummary,
  inferNeighborhood,
  isTargetNeighborhood,
  pickIcon,
} from "./normalizeActivity.mjs";

const ADULT_AGE_PATTERN =
  /^(adult|senior|teen|young adult)$|18 and up|21 and up|40 and up|55 and up|60 and up|16 and up/i;

const KID_AGE_LABELS = /^(all ages|early childhood|youth)$/i;

const MATURE_RATING = /\b(PG-13|NC-17|R)\s*\|/;

function cleanText(value) {
  if (value == null) return null;
  const trimmed = String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
  return trimmed || null;
}

export function parseCpdDateTime(value) {
  const raw = cleanText(value);
  if (!raw) return { date: null, time: null };

  const match = raw.match(/^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (!match) return { date: null, time: null };

  return {
    date: match[1],
    time: match[2] != null ? `${match[2]}:${match[3]}` : null,
  };
}

export function isFree(fee) {
  if (fee == null || fee === "") return true;
  const amount = Number(String(fee).replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) && amount === 0;
}

export function isKidFriendly({ ageRange, description, type }) {
  const age = cleanText(ageRange);

  if (age && ADULT_AGE_PATTERN.test(age)) return false;
  if (age && KID_AGE_LABELS.test(age)) return true;
  if (age && /and under/i.test(age)) return true;

  const atLeast = age?.match(/at least (\d+)/i);
  if (atLeast && Number(atLeast[1]) >= 13) return false;
  if (atLeast) return true;

  if (MATURE_RATING.test(description ?? "")) return false;

  return type === "Event";
}

export function eventPageUrl(row) {
  const info = row?.information_link?.url;
  if (typeof info === "string" && info.trim()) return info.trim();
  if (row?.activity_id) {
    return `https://www.chicagoparkdistrict.com/events/${row.activity_id}`;
  }
  return null;
}

export function cpdRowHash(activityId) {
  return createHash("sha256")
    .update(`cpd|${activityId ?? ""}`)
    .digest("hex")
    .slice(0, 32);
}

export function cpdActivityId(activityId) {
  return `cpd:${activityId}`;
}

export function normalizeCpdActivity(row) {
  const activityId = cleanText(row?.activity_id);
  const title = cleanText(row?.title);
  const description = cleanText(row?.description);
  const dateNotes = cleanText(row?.date_notes);
  const facility = cleanText(row?.location_facility);
  const addressLine = cleanText(row?.address);
  const zip = cleanText(row?.zip);
  const eventLink = eventPageUrl(row);
  const { date, time: startTime } = parseCpdDateTime(row?.start_date);
  const { date: endDate, time: endTime } = parseCpdDateTime(row?.end_date);
  const ageRange = cleanText(row?.age_range) ?? "All ages";
  const summarySource = [description, dateNotes].filter(Boolean).join(" ");

  const address = [addressLine, zip].filter(Boolean).join(", ");
  const neighborhood = inferNeighborhood(facility, address);
  const hash = cpdRowHash(activityId);

  const staging = {
    event_name: title,
    library_name: facility,
    event_link: eventLink,
    location: address || facility,
    time_raw: [startTime, endTime].filter(Boolean).join("–") || dateNotes,
    date_raw: date,
    age_range: ageRange,
    registration_required_raw: row?.registration_date ?? null,
    registration_date: row?.registration_date ?? null,
    notes: summarySource,
    source_sheet: "cpd",
    row_hash: hash,
    raw: row,
  };

  if (row?.event_cancelled === "Y" || row?.event_cancelled === true) {
    return { staging, activity: null, skipReason: "cancelled" };
  }

  if (!isFree(row?.fee)) {
    return { staging, activity: null, skipReason: "not-free" };
  }

  if (!isKidFriendly({ ageRange: row?.age_range, description, type: row?.type })) {
    return { staging, activity: null, skipReason: "not-kid-audience" };
  }

  if (!activityId || !title || !eventLink || !date) {
    return { staging, activity: null, skipReason: "missing-required-fields" };
  }

  const registrationRequired = Boolean(
    row?.type === "Program" && row?.registration_date,
  );

  return {
    staging,
    skipReason: null,
    activity: {
      id: cpdActivityId(activityId),
      title,
      summary: buildSummary(summarySource, ageRange),
      icon: pickIcon(title, ageRange),
      date,
      start_time: startTime,
      end_time: endTime,
      venue: facility ?? "Chicago Park District",
      address: address || facility,
      neighborhood,
      age_group: ageRange,
      registration_required: registrationRequired,
      source_url: eventLink,
      source_name: "Chicago Park District",
      notes: summarySource,
      end_date: endDate && endDate !== date ? endDate : null,
      status:
        neighborhood && isTargetNeighborhood(neighborhood)
          ? "published"
          : "draft",
    },
  };
}
