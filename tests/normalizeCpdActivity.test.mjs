import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cpdActivityId,
  isFree,
  isKidFriendly,
  normalizeCpdActivity,
} from "../scripts/lib/normalizeCpdActivity.mjs";
import { inferNeighborhood } from "../scripts/lib/normalizeActivity.mjs";
import { buildCpdQuery } from "../scripts/sources/cpd.mjs";

const wildRobot = {
  activity_id: "583031",
  type: "Event",
  title: "Movies in the Parks at Wrightwood",
  description:
    "THE WILD ROBOT After a shipwreck, an intelligent robot called Roz is stranded. PG | 101 minutes | 2024",
  start_date: "2026-09-04T20:00:00.000",
  end_date: "2026-09-04T21:41:00.000",
  location_facility: "Wrightwood Park",
  category: "Movies, Night Out in the Parks",
  fee: "0",
  information_link: {
    url: "https://www.chicagoparkdistrict.com/events/movies-parks-wrightwood-1",
  },
  event_cancelled: "N",
  address: "2534 N. Greenview Ave.",
  zip: "60614",
};

const nottingHill = {
  ...wildRobot,
  activity_id: "583454",
  description:
    "NOTTING HILL PG-13 | 123 minutes | 1999 *Closed Captioned",
};

const hamlinBoxing = {
  activity_id: "587263",
  type: "Program",
  title: "Boxing at Hamlin",
  description: "September 19, 2026 to December 12, 2026",
  date_notes:
    "From September 19, 2026 to December 12, 2026 Each Saturday from 10:15am to 11:15am",
  start_date: "2026-09-19T10:15:00.000",
  end_date: "2026-12-12T11:15:00.000",
  location_facility: "Hamlin (Hannibal) Park",
  age_range: "Youth",
  fee: "0",
  information_link: {
    url: "http://apm.activecommunities.com/chicagoparkdistrict/Activity_Search/587263",
  },
  registration_date: "2026-08-04T14:00:00.000",
  address: "3035 N. Hoyne Ave.",
  zip: "60618",
};

describe("isFree", () => {
  it("treats zero and empty fees as free", () => {
    assert.equal(isFree("0"), true);
    assert.equal(isFree(""), true);
    assert.equal(isFree("128"), false);
  });
});

describe("isKidFriendly", () => {
  it("includes youth programs and PG movies", () => {
    assert.equal(
      isKidFriendly({ ageRange: "Youth", type: "Program" }),
      true,
    );
    assert.equal(
      isKidFriendly({
        description: wildRobot.description,
        type: "Event",
      }),
      true,
    );
  });

  it("skips adult programs and PG-13 movies", () => {
    assert.equal(
      isKidFriendly({ ageRange: "Adult", type: "Program" }),
      false,
    );
    assert.equal(
      isKidFriendly({
        description: nottingHill.description,
        type: "Event",
      }),
      false,
    );
  });
});

describe("normalizeCpdActivity", () => {
  it("publishes a free Wrightwood movie in Lincoln Park", () => {
    const { activity, skipReason } = normalizeCpdActivity(wildRobot);
    assert.equal(skipReason, null);
    assert.equal(activity.id, "cpd:583031");
    assert.equal(activity.neighborhood, "Lincoln Park");
    assert.equal(activity.status, "published");
    assert.equal(activity.date, "2026-09-04");
    assert.equal(activity.start_time, "20:00");
    assert.equal(activity.source_name, "Chicago Park District");
  });

  it("uses a source-scoped id", () => {
    assert.equal(cpdActivityId("583031"), "cpd:583031");
  });

  it("skips PG-13 movies without a kid age range", () => {
    const { skipReason } = normalizeCpdActivity(nottingHill);
    assert.equal(skipReason, "not-kid-audience");
  });

  it("skips paid programs", () => {
    const { skipReason } = normalizeCpdActivity({
      ...hamlinBoxing,
      fee: "128",
    });
    assert.equal(skipReason, "not-free");
  });

  it("publishes free youth programs at Hamlin in Roscoe Village", () => {
    const { activity, skipReason } = normalizeCpdActivity(hamlinBoxing);
    assert.equal(skipReason, null);
    assert.equal(activity.neighborhood, "Roscoe Village");
    assert.equal(activity.status, "published");
    assert.equal(activity.end_date, "2026-12-12");
    assert.equal(activity.registration_required, true);
  });

  it("skips cancelled events", () => {
    const { skipReason } = normalizeCpdActivity({
      ...wildRobot,
      event_cancelled: "Y",
    });
    assert.equal(skipReason, "cancelled");
  });
});

describe("inferNeighborhood", () => {
  it("maps Wrightwood Park to Lincoln Park", () => {
    assert.equal(inferNeighborhood("Wrightwood Park", null), "Lincoln Park");
  });
});

describe("buildCpdQuery", () => {
  it("requests the five neighborhood parks", () => {
    const url = decodeURIComponent(buildCpdQuery()).replaceAll("+", " ");
    assert.match(url, /Wrightwood Park/);
    assert.match(url, /Hamlin \(Hannibal\) Park/);
    assert.match(url, /Trebes \(Robert\) Park/);
    assert.match(url, /Gill \(Joseph\) Park/);
    assert.match(url, /Donahue \(Margaret\) Park/);
  });
});
