import { createHash } from "node:crypto";
import {
  chicagoToday,
  maxYmd,
  weekdayDates,
} from "./chicagoDates.mjs";
import {
  buildSummary,
  inferNeighborhood,
  isTargetNeighborhood,
  pickIcon,
} from "./normalizeActivity.mjs";

const SKIP_PATTERN =
  /coffee\s*&\s*commerce|federal tap|network (on the river|night)|grown-?ups?|networking|wine (tasting|dinner)|beer stroll|cocktail crawl|legislative|consent decree|school tour|new member|romancing|brunch fest|art of maki|ikebana|bellydance|tavern|grand opening(?!.*playdate)/i;

const ALLOW_PATTERN =
  /market|fest|shakespeare|halloween|trick or treat|tree lighting|menorah|winterfest|playdate|choo\s?choo|hula hoop|yard sale|garden walk|taco|retro on roscoe|paws chicago|adoption|neighbor party|orchestra|bounce|carnival|story|kids?|family|children|farmers/i;

const PAID_PATTERN =
  /\$\d+|tickets?\s*\$|purchase tickets|early bird|for a \$\d+/i;

export function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function localActivityId(source, slug, date) {
  return `local:${source}:${slug}:${date}`;
}

export function localRowHash(id) {
  return createHash("sha256").update(id).digest("hex").slice(0, 32);
}

export function isPaidLocalEvent({ title, description, category } = {}) {
  const text = `${title ?? ""} ${description ?? ""} ${category ?? ""}`;
  return PAID_PATTERN.test(text);
}

export function isKidFriendlyLocalEvent({ title, description, category } = {}) {
  const text = `${title ?? ""} ${description ?? ""} ${category ?? ""}`;
  if (SKIP_PATTERN.test(text)) return false;
  if (/^business$/i.test(category ?? "")) return false;
  return ALLOW_PATTERN.test(text);
}

function toActivity({
  source,
  slug,
  title,
  date,
  startTime,
  endTime,
  venue,
  address,
  sourceUrl,
  description,
  ageGroup,
  sourceName,
}) {
  const id = localActivityId(source, slug, date);
  const neighborhood = inferNeighborhood(
    `${title} ${venue ?? ""}`,
    address,
  );
  const summarySource = description;

  return {
    staging: {
      event_name: title,
      library_name: venue,
      event_link: sourceUrl,
      location: address || venue,
      time_raw: [startTime, endTime].filter(Boolean).join("–"),
      date_raw: date,
      age_range: ageGroup,
      registration_required_raw: null,
      registration_date: null,
      notes: summarySource,
      source_sheet: "local",
      row_hash: localRowHash(id),
      raw: { source, slug, title, date, venue, address, sourceUrl },
    },
    skipReason: null,
    activity: {
      id,
      title,
      summary: buildSummary(summarySource, ageGroup),
      icon: pickIcon(title, ageGroup),
      date,
      start_time: startTime,
      end_time: endTime,
      venue: venue ?? "See event page",
      address: address || venue,
      neighborhood,
      age_group: ageGroup,
      registration_required: false,
      source_url: sourceUrl,
      source_name: sourceName,
      notes: summarySource,
      end_date: null,
      status:
        neighborhood && isTargetNeighborhood(neighborhood)
          ? "published"
          : "draft",
    },
  };
}

export function normalizeLrvEvent(event) {
  const title = event?.title?.trim();
  const date = event?.date;
  const sourceUrl = event?.sourceUrl;
  const slug = slugify(title);
  const venue = event?.venue ?? null;
  const address = event?.address ?? null;
  const description = event?.description ?? null;

  const stagingBase = {
    event_name: title ?? null,
    library_name: venue,
    event_link: sourceUrl ?? null,
    location: address || venue,
    time_raw: [event?.startTime, event?.endTime].filter(Boolean).join("–"),
    date_raw: date ?? null,
    age_range: "All ages",
    registration_required_raw: null,
    registration_date: null,
    notes: description,
    source_sheet: "local",
    row_hash: localRowHash(
      localActivityId("lrvcc", slug || "event", date || "undated"),
    ),
    raw: event,
  };

  if (!title || !date || !sourceUrl) {
    return {
      staging: stagingBase,
      activity: null,
      skipReason: "missing-required-fields",
    };
  }

  if (isPaidLocalEvent(event)) {
    return { staging: stagingBase, activity: null, skipReason: "not-free" };
  }

  if (!isKidFriendlyLocalEvent(event)) {
    return {
      staging: stagingBase,
      activity: null,
      skipReason: "not-kid-audience",
    };
  }

  return toActivity({
    source: "lrvcc",
    slug,
    title,
    date,
    startTime: event.startTime ?? null,
    endTime: event.endTime ?? null,
    venue,
    address,
    sourceUrl,
    description,
    ageGroup: "All ages",
    sourceName: "Lakeview Roscoe Village Chamber",
  });
}

export function generateGreenCityMarketLincoln(now = new Date()) {
  const today = chicagoToday(now);
  const year = Number(today.slice(0, 4));
  const seasonStart = `${year}-05-02`;
  const seasonEnd = `${year}-11-21`;
  if (today > seasonEnd) return [];

  const start = maxYmd(today, seasonStart);
  return weekdayDates(start, seasonEnd, [3, 6]).map((date) =>
    toActivity({
      source: "gcm-lincoln",
      slug: "market",
      title: "Green City Market Lincoln Park",
      date,
      startTime: "07:00",
      endTime: "13:00",
      venue: "Green City Market Lincoln Park",
      address: "1817 N Clark St, Chicago, IL 60614",
      sourceUrl: "https://www.greencitymarket.org/market/details/lincoln",
      description:
        "Outdoor farmers market Saturdays and Wednesdays, 7:00 AM–1:00 PM, through November 21.",
      ageGroup: "All ages",
      sourceName: "Green City Market",
    }),
  );
}

export function generateRoscoeBooksStoryTime(now = new Date()) {
  const today = chicagoToday(now);
  const year = Number(today.slice(0, 4));
  const seasonEnd = `${year + 1}-06-30`;
  const dates = weekdayDates(today, seasonEnd, [4]).filter((date) => {
    const month = Number(date.slice(5, 7));
    return month !== 7 && month !== 8;
  });

  return dates.map((date) =>
    toActivity({
      source: "roscoe-books",
      slug: "story-time",
      title: "Roscoe Books Story Time",
      date,
      startTime: "11:00",
      endTime: null,
      venue: "Roscoe Books",
      address: "2142 W Roscoe St, Chicago, IL 60618",
      sourceUrl: "https://roscoebooks.com/story-time",
      description:
        "Weekly story time Thursdays at 11:00 AM for ages 1–4. On hiatus in July and August.",
      ageGroup: "Ages 1–4",
      sourceName: "Roscoe Books",
    }),
  );
}
