import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  activityDedupeKey,
  collidingActivityIds,
  dedupeActivitiesByEvent,
  fingerprint,
} from "../scripts/lib/dedupeByEvent.mjs";

describe("fingerprint", () => {
  it("treats Green City Market titles with and without @ as the same", () => {
    assert.equal(
      fingerprint("Green City Market @ Lincoln Park"),
      fingerprint("Green City Market Lincoln Park"),
    );
  });
});

describe("dedupeActivitiesByEvent", () => {
  it("keeps the ingest id when a sheet hash covers the same market day", () => {
    const sheet = {
      id: "abc123hash",
      title: "Roscoe Village Farmers Market",
      date: "2026-08-16",
      venue: "Hamlin Park",
      status: "published",
    };
    const ingest = {
      id: "local:lrvcc:roscoe-village-farmers-market:2026-08-16",
      title: "Roscoe Village Farmers Market",
      date: "2026-08-16",
      venue: "Hamlin Park",
      start_time: "09:00",
      status: "published",
    };

    const kept = dedupeActivitiesByEvent([sheet, ingest]);
    assert.equal(kept.length, 1);
    assert.equal(kept[0].id, ingest.id);
    assert.deepEqual(collidingActivityIds([sheet, ingest]), [sheet.id]);
  });

  it("does not collapse same-titled story times at different venues", () => {
    const merlo = {
      id: "cpl:1",
      title: "Story Time",
      date: "2026-08-16",
      venue: "Merlo",
      status: "published",
    };
    const lincolnPark = {
      id: "cpl:2",
      title: "Story Time",
      date: "2026-08-16",
      venue: "Lincoln Park",
      status: "published",
    };

    assert.notEqual(activityDedupeKey(merlo), activityDedupeKey(lincolnPark));
    assert.equal(dedupeActivitiesByEvent([merlo, lincolnPark]).length, 2);
  });
});
