import { createHash } from "node:crypto";

export const TARGET_NEIGHBORHOODS = [
  "Lakeview",
  "Roscoe Village",
  "Lincoln Park",
];

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const ZIP_NEIGHBORHOODS = {
  60614: "Lincoln Park",
  60657: "Lakeview",
  60613: "Lakeview",
};

const NAME_NEIGHBORHOODS = [
  [/roscoe/i, "Roscoe Village"],
  [/lakeview|lake view/i, "Lakeview"],
  [/lincoln park/i, "Lincoln Park"],
];

const STREET_HINTS = [
  [/paulina/i, "Roscoe Village"],
  [/roscoe/i, "Roscoe Village"],
  [/southport/i, "Lakeview"],
  [/belmont/i, "Lakeview"],
  [/wellington/i, "Lakeview"],
  [/clark st|n clark/i, "Lincoln Park"],
  [/fullerton/i, "Lincoln Park"],
  [/armitage/i, "Lincoln Park"],
  [/orchard/i, "Lincoln Park"],
];

function clean(value) {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  return trimmed;
}

export function rowHash(parts) {
  return createHash("sha256")
    .update(parts.join("|"))
    .digest("hex")
    .slice(0, 32);
}

export function offerIdFromKey(restaurantName, address, offerSummary) {
  return createHash("sha256")
    .update([restaurantName ?? "", address ?? "", offerSummary ?? ""].join("|"))
    .digest("hex")
    .slice(0, 16);
}

function looksLikeOfferText(value) {
  if (!value) return false;
  return /(kids eat free|free kids|1 free|purchase of adult|with purchase)/i.test(
    value,
  );
}

function looksLikeArticleRow(name) {
  if (!name) return true;
  return /^(chicago restaurants where|15 places for|special spots)/i.test(name);
}

function maybeSwapMisalignedColumns(row) {
  const restaurantName = clean(row["Restaurant Name"]);
  const offer = clean(row.Offer);
  const offerDetails = clean(row["Offer Details"]);

  // Macaroni KID-style rows often put the deal text in Restaurant Name
  // and the restaurant name in Offer.
  if (
    looksLikeOfferText(restaurantName) &&
    offer &&
    !looksLikeOfferText(offer) &&
    offer.length < 80
  ) {
    return {
      ...row,
      "Restaurant Name": offer,
      Offer: restaurantName,
      "Offer Details": offerDetails ?? restaurantName,
    };
  }

  return row;
}

export function inferNeighborhood(restaurantName, address) {
  const name = clean(restaurantName) ?? "";
  const addr = clean(address) ?? "";

  for (const [pattern, neighborhood] of NAME_NEIGHBORHOODS) {
    if (pattern.test(name)) return neighborhood;
  }

  const zipMatch = addr.match(/\b(606\d{2})\b/);
  if (zipMatch && ZIP_NEIGHBORHOODS[zipMatch[1]]) {
    // Paulina + 60657 is usually Roscoe Village
    if (zipMatch[1] === "60657" && /paulina/i.test(addr)) {
      return "Roscoe Village";
    }
    return ZIP_NEIGHBORHOODS[zipMatch[1]];
  }

  for (const [pattern, neighborhood] of STREET_HINTS) {
    if (pattern.test(addr) || pattern.test(name)) return neighborhood;
  }

  return null;
}

export function parseEligibleDays(datesOfOffer, offerText = "") {
  const combined = `${datesOfOffer ?? ""} ${offerText ?? ""}`;
  if (!clean(combined)) return [];

  if (/every day|daily|7 days|monday;\s*tuesday;\s*wednesday;\s*thursday;\s*friday;\s*saturday;\s*sunday/i.test(combined)) {
    return [...DAY_NAMES];
  }

  const days = new Set();

  const rangeMatch = combined.match(
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*[-–—to]+\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  );
  if (rangeMatch) {
    const start = DAY_NAMES.findIndex(
      (day) => day.toLowerCase() === rangeMatch[1].toLowerCase(),
    );
    const end = DAY_NAMES.findIndex(
      (day) => day.toLowerCase() === rangeMatch[2].toLowerCase(),
    );
    if (start !== -1 && end !== -1) {
      if (start <= end) {
        for (let i = start; i <= end; i += 1) days.add(DAY_NAMES[i]);
      } else {
        for (let i = start; i < DAY_NAMES.length; i += 1) days.add(DAY_NAMES[i]);
        for (let i = 0; i <= end; i += 1) days.add(DAY_NAMES[i]);
      }
    }
  }

  for (const day of DAY_NAMES) {
    const pattern = new RegExp(`\\b${day}s?\\b`, "i");
    if (pattern.test(combined)) days.add(day);
  }

  if (/weekdays?/i.test(combined)) {
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].forEach((day) =>
      days.add(day),
    );
  }
  if (/weekends?/i.test(combined)) {
    days.add("Saturday");
    days.add("Sunday");
  }

  return DAY_NAMES.filter((day) => days.has(day));
}

export function formatEligibleHours(timeOfOffer) {
  const value = clean(timeOfOffer);
  if (!value) return null;

  // Keep first range if article rows stuffed many times together.
  const first = value.split(";")[0].trim();

  const twentyFour = first.match(/^(\d{1,2}):(\d{2})(?:-(\d{1,2}):(\d{2}))?$/);
  if (twentyFour) {
    const start = toDisplayTime(Number(twentyFour[1]), Number(twentyFour[2]));
    if (twentyFour[3] != null) {
      const end = toDisplayTime(Number(twentyFour[3]), Number(twentyFour[4]));
      return `${start}–${end}`;
    }
    return `From ${start}`;
  }

  return first;
}

function toDisplayTime(hours, minutes) {
  const meridiem = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${meridiem}`;
}

export function parseMaximumChildAge(...texts) {
  const combined = texts.filter(Boolean).join(" ");
  const patterns = [
    /kids?\s+(\d+)\s+and under/i,
    /children?\s+(\d+)\s+and under/i,
    /under\s+(\d+)/i,
    /(\d+)\s+and under/i,
    /kids?\s+(\d+)\s+yrs?/i,
    /(\d+)\s*yrs?\s+and younger/i,
  ];

  for (const pattern of patterns) {
    const match = combined.match(pattern);
    if (match) return Number(match[1]);
  }
  return null;
}

export function parseAdultPurchaseRequired(...texts) {
  const combined = texts.filter(Boolean).join(" ").toLowerCase();
  if (!combined) return true;
  if (
    /with purchase|adult (meal|entree|entrée)|per adult|qualifying adult|regular-priced adult/.test(
      combined,
    )
  ) {
    return true;
  }
  return true;
}

export function parseDineInOnly(...texts) {
  const combined = texts.filter(Boolean).join(" ").toLowerCase();
  if (/dine-?in only|dine in only/.test(combined)) return true;
  if (/takeout|take-out|delivery/.test(combined) && !/dine-?in only/.test(combined)) {
    return false;
  }
  return true;
}

export function isTargetNeighborhood(neighborhood) {
  return TARGET_NEIGHBORHOODS.includes(neighborhood);
}

export function normalizeSheetRow(rawRow) {
  const row = maybeSwapMisalignedColumns(rawRow);

  const restaurantName = clean(row["Restaurant Name"]);
  const address = clean(row.Address);
  const website = clean(row.Website);
  const datesOfOffer = clean(row["Dates of Offer"]);
  const timeOfOffer = clean(row["Time of Offer"]);
  const offer = clean(row.Offer);
  const offerDetails = clean(row["Offer Details"]);
  const sourceName = clean(row.Source);
  const sourceUrl = clean(row["Source URL"]);
  const retrievedAt = clean(row["Retrieved At (UTC)"]);

  const staging = {
    restaurant_name: restaurantName,
    address,
    website,
    dates_of_offer: datesOfOffer,
    time_of_offer: timeOfOffer,
    offer,
    offer_details: offerDetails,
    source_name: sourceName,
    source_url: sourceUrl,
    retrieved_at: retrievedAt,
    row_hash: rowHash([
      restaurantName ?? "",
      address ?? "",
      datesOfOffer ?? "",
      timeOfOffer ?? "",
      offer ?? "",
      sourceUrl ?? "",
    ]),
    raw: rawRow,
  };

  if (!restaurantName || looksLikeArticleRow(restaurantName)) {
    return { staging, offer: null };
  }

  const neighborhood = inferNeighborhood(restaurantName, address);
  const eligibleDays = parseEligibleDays(
    datesOfOffer,
    `${offer ?? ""} ${offerDetails ?? ""}`,
  );
  const eligibleHours = formatEligibleHours(timeOfOffer);
  const offerSummary =
    offerDetails && offerDetails.length > 20
      ? offerDetails.slice(0, 280)
      : offer ?? "Kids eat free — see source for details.";

  const maximumChildAge = parseMaximumChildAge(offer, offerDetails);
  const adultPurchaseRequired = parseAdultPurchaseRequired(offer, offerDetails);
  const dineInOnly = parseDineInOnly(offer, offerDetails);

  const hasUsableSignal =
    Boolean(datesOfOffer || eligibleDays.length > 0 || offer || offerDetails);

  if (!hasUsableSignal) {
    return { staging, offer: null };
  }

  const status =
    neighborhood &&
    isTargetNeighborhood(neighborhood) &&
    eligibleDays.length > 0
      ? "published"
      : "draft";

  return {
    staging,
    offer: {
      id: offerIdFromKey(restaurantName, address, offerSummary),
      restaurant_name: restaurantName,
      neighborhood,
      address,
      website,
      eligible_days: eligibleDays,
      eligible_hours: eligibleHours ?? "See offer details",
      offer_summary: offerSummary,
      adult_purchase_required: adultPurchaseRequired,
      maximum_child_age: maximumChildAge,
      dine_in_only: dineInOnly,
      confirmed: false,
      source_name: sourceName,
      source_url: sourceUrl ?? website,
      notes: offer,
      status,
    },
  };
}
