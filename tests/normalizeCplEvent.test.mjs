import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cplActivityId,
  isKidAudience,
  normalizeCplEvent,
  parseCplDateTime,
} from "../scripts/lib/normalizeCplEvent.mjs";
import { inferNeighborhood } from "../scripts/lib/normalizeActivity.mjs";
import { buildCplQuery } from "../scripts/sources/cpl.mjs";

const merloStorytime = {
  event_id: "6a70a7b40d65ac3600440cde",
  title: "Musical Monday: Stories and More",
  description:
    "Join us for a music themed&nbsp;story time. For families with kids 3 to 7.",
  event_types: "Story Time",
  event_audiences: "Kids (Kids: 6 to 13 years) | Preschoolers (Preschoolers: 3 to 5 years)",
  event_page: {
    url: "https://chipublib.bibliocommons.com/events/6a70a7b40d65ac3600440cde",
  },
  location_name: "Lincoln Belmont",
  location_address: "1659 W. Melrose Street",
  location_zip: "60657",
  start: "2026-08-17T10:30:00.000",
  end: "2026-08-17T11:45:00.000",
  cancelled: false,
  registration_status: "NOT REQUIRED",
};

describe("parseCplDateTime", () => {
  it("reads Chicago wall time without shifting the calendar date", () => {
    const parsed = parseCplDateTime("2026-08-17T10:30:00.000");
    assert.equal(parsed.date, "2026-08-17");
    assert.equal(parsed.time, "10:30");
  });
});

describe("isKidAudience", () => {
  it("accepts kids and preschoolers", () => {
    assert.equal(isKidAudience(merloStorytime.event_audiences), true);
  });

  it("rejects adult-only programs", () => {
    assert.equal(isKidAudience("Adults (Adults: 18 and up)"), false);
  });
});

describe("normalizeCplEvent", () => {
  it("publishes a kid event at Lincoln Belmont in Lakeview", () => {
    const { activity, skipReason } = normalizeCplEvent(merloStorytime);
    assert.equal(skipReason, null);
    assert.equal(activity.id, "cpl:6a70a7b40d65ac3600440cde");
    assert.equal(activity.neighborhood, "Lakeview");
    assert.equal(activity.status, "published");
    assert.equal(activity.date, "2026-08-17");
    assert.equal(activity.start_time, "10:30");
    assert.equal(activity.end_time, "11:45");
    assert.equal(activity.registration_required, false);
    assert.equal(activity.source_name, "Chicago Public Library");
    assert.equal(activity.venue, "Lincoln Belmont Library");
  });

  it("uses a source-scoped id instead of hashing title and date", () => {
    assert.equal(
      cplActivityId("abc123"),
      "cpl:abc123",
    );
    const renamed = normalizeCplEvent({
      ...merloStorytime,
      title: "Renamed story time",
    });
    assert.equal(renamed.activity.id, "cpl:6a70a7b40d65ac3600440cde");
  });

  it("skips cancelled events", () => {
    const { activity, skipReason } = normalizeCplEvent({
      ...merloStorytime,
      cancelled: true,
    });
    assert.equal(activity, null);
    assert.equal(skipReason, "cancelled");
  });

  it("skips library closures", () => {
    const { skipReason } = normalizeCplEvent({
      ...merloStorytime,
      event_types: "Library Closures",
    });
    assert.equal(skipReason, "library-closure");
  });

  it("skips adult-only events", () => {
    const { skipReason } = normalizeCplEvent({
      ...merloStorytime,
      title: "Adult Book Discussion",
      event_audiences: "Adults (Adults: 18 and up)",
    });
    assert.equal(skipReason, "not-kid-audience");
  });

  it("drafts events outside the target neighborhoods", () => {
    const { activity } = normalizeCplEvent({
      ...merloStorytime,
      location_name: "Uptown",
      location_address: "929 W. Buena Avenue",
      location_zip: "60613",
    });
    assert.equal(activity.status, "draft");
    assert.notEqual(activity.neighborhood, "Lakeview");
  });
});

describe("inferNeighborhood", () => {
  it("maps Wrigleyville to Lakeview", () => {
    assert.equal(inferNeighborhood("Wrigleyville", null), "Lakeview");
  });
});

describe("buildCplQuery", () => {
  it("requests the three target branches and omits Uptown", () => {
    const url = decodeURIComponent(buildCplQuery()).replaceAll("+", " ");
    assert.match(url, /Merlo/);
    assert.match(url, /Lincoln Belmont/);
    assert.match(url, /Lincoln Park/);
    assert.doesNotMatch(url, /Uptown/);
  });
});
