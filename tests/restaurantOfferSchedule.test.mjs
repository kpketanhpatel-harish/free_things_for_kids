import assert from "node:assert/strict";
import { describe, it } from "node:test";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function addDaysYmd(ymd, days) {
  const [year, month, day] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function weekdayNameForYmd(ymd) {
  const [year, month, day] = ymd.split("-").map(Number);
  return DAY_NAMES[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

function offerIsEligibleOnYmd(offer, ymd) {
  return (offer.eligibleDays ?? []).includes(weekdayNameForYmd(ymd));
}

function nextEligibleYmd(offer, fromYmd, inclusive = true) {
  if (!offer.eligibleDays?.length) return null;
  for (let offset = inclusive ? 0 : 1; offset <= 7; offset += 1) {
    const ymd = addDaysYmd(fromYmd, offset);
    if (offerIsEligibleOnYmd(offer, ymd)) return ymd;
  }
  return null;
}

function proximityLabel(todayYmd, ymd) {
  if (ymd === todayYmd) return "Tonight";
  if (ymd === addDaysYmd(todayYmd, 1)) return "Tomorrow";
  return weekdayNameForYmd(ymd);
}

function formatOfferHours(hours) {
  if (!hours) return null;
  const trimmed = hours.trim();
  if (!trimmed || /^see offer details$/i.test(trimmed)) return null;
  if (/all\s*day/i.test(trimmed)) return "All day";
  return trimmed.replace(/\s*-\s*/g, "–").replace(/\s*–\s*/g, "–");
}

function formatOfferWhen(offer, todayYmd, forYmd) {
  const ymd = forYmd ?? nextEligibleYmd(offer, todayYmd) ?? todayYmd;
  const label = proximityLabel(todayYmd, ymd);
  const hours = formatOfferHours(offer.eligibleHours);
  return hours ? `${label} · ${hours}` : label;
}

function groupUpcomingOffers(offers, startFromYmd, todayYmd, maxDays = 4, maxOffers = 10) {
  const groups = [];
  const seen = new Set();
  let count = 0;
  for (let offset = 0; offset < 14; offset += 1) {
    if (groups.length >= maxDays || count >= maxOffers) break;
    const ymd = addDaysYmd(startFromYmd, offset);
    const dayOffers = offers.filter(
      (offer) => !seen.has(offer.id) && offerIsEligibleOnYmd(offer, ymd),
    );
    if (dayOffers.length === 0) continue;
    const slice = dayOffers.slice(0, maxOffers - count);
    for (const offer of slice) seen.add(offer.id);
    const heading =
      ymd === addDaysYmd(todayYmd, 1)
        ? `Tomorrow — ${weekdayNameForYmd(ymd)}`
        : weekdayNameForYmd(ymd);
    groups.push({ ymd, weekday: weekdayNameForYmd(ymd), heading, offers: slice });
    count += slice.length;
  }
  return groups;
}

const mondayThursday = {
  id: "farm-bar",
  eligibleDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
  eligibleHours: "4:00–6:00 PM",
};

const tuesdayOnly = {
  id: "little-goat",
  eligibleDays: ["Tuesday"],
  eligibleHours: "4:00–7:00 PM",
};

const everyDay = {
  id: "crosby",
  eligibleDays: DAY_NAMES,
  eligibleHours: "4:00–6:00 PM",
};

describe("kids eat free upcoming schedule", () => {
  it("computes the next eligible calendar date from Saturday", () => {
    assert.equal(nextEligibleYmd(mondayThursday, "2026-08-29"), "2026-08-31");
    assert.equal(nextEligibleYmd(mondayThursday, "2026-08-31"), "2026-08-31");
    assert.equal(nextEligibleYmd(tuesdayOnly, "2026-08-29"), "2026-09-01");
  });

  it("labels tonight, tomorrow, and weekday names", () => {
    assert.equal(proximityLabel("2026-08-29", "2026-08-29"), "Tonight");
    assert.equal(proximityLabel("2026-08-29", "2026-08-30"), "Tomorrow");
    assert.equal(proximityLabel("2026-08-29", "2026-08-31"), "Monday");
  });

  it("formats tonight with hours", () => {
    assert.equal(
      formatOfferWhen(everyDay, "2026-08-29", "2026-08-29"),
      "Tonight · 4:00–6:00 PM",
    );
    assert.equal(
      formatOfferWhen(tuesdayOnly, "2026-08-29", "2026-09-01"),
      "Tuesday · 4:00–7:00 PM",
    );
  });

  it("does not repeat a Mon–Thu restaurant across upcoming days", () => {
    const groups = groupUpcomingOffers(
      [mondayThursday, tuesdayOnly],
      "2026-08-30",
      "2026-08-29",
    );
    const ids = groups.flatMap((group) => group.offers.map((offer) => offer.id));
    assert.equal(ids.filter((id) => id === "farm-bar").length, 1);
    assert.equal(groups[0].weekday, "Monday");
    assert.ok(ids.includes("little-goat"));
  });

  it("labels the next calendar day as Tomorrow — weekday", () => {
    const groups = groupUpcomingOffers([everyDay], "2026-08-30", "2026-08-29", 1, 10);
    assert.equal(groups[0].heading, "Tomorrow — Sunday");
  });

  it("keeps tonight empty when only weekday deals exist", () => {
    assert.equal(offerIsEligibleOnYmd(mondayThursday, "2026-08-29"), false);
    assert.equal(offerIsEligibleOnYmd(everyDay, "2026-08-29"), true);
  });
});
