import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { upcomingMonthKeys, weekdayDates } from "../scripts/lib/chicagoDates.mjs";
import { parseLrvCalendarHtml } from "../scripts/lib/parseLrvCalendar.mjs";
import { inferNeighborhood } from "../scripts/lib/normalizeActivity.mjs";
import {
  generateGreenCityMarketLincoln,
  generateRoscoeBooksStoryTime,
  isKidFriendlyLocalEvent,
  isPaidLocalEvent,
  localActivityId,
  normalizeLrvEvent,
} from "../scripts/lib/normalizeLocalEvent.mjs";
import { buildLrvCalendarUrl } from "../scripts/sources/local.mjs";

const marketHtml = `
<h1 class="eventlist-title"><a href="/events-calendar/roscoe-village-farmers-market-3-lxeat" class="eventlist-title-link">Roscoe Village Farmers Market </a></h1>
        <ul class="eventlist-meta event-meta">
          <li class="eventlist-meta-item eventlist-meta-date event-meta-item">
            <time class="event-date" datetime="2026-08-16">Sunday, August 16, 2026</time>
          </li>
          <li class="eventlist-meta-item eventlist-meta-time event-meta-item">
            <span class="event-time-localized">
              <time class="event-time-localized-start" datetime="2026-08-16">9:00\u202fAM</time>
              <time class="event-time-localized-end" datetime="2026-08-16">1:00\u202fPM</time>
            </span>
          </li>
            <li class="eventlist-meta-item eventlist-meta-address event-meta-item">
                Hamlin Park
              <a href="http://maps.google.com?q=3035%20North%20Hoyne%20Avenue%20Chicago%2C%20IL%2C%2060618%20United%20States" class="eventlist-meta-address-maplink">(map)</a>
            </li>
        </ul>
          <div class="eventlist-description"><div><div><div>
            <p>The Roscoe Village Market will take place on Sundays from 9:00 am - 1:00 pm at Hamlin Park.</p>
          </div></div></div>
`;

const coffeeHtml = `
<h1 class="eventlist-title"><a href="/events-calendar/coffee-commerce-2" class="eventlist-title-link">Coffee &amp; Commerce</a></h1>
        <ul class="eventlist-meta event-meta">
          <li><time class="event-date" datetime="2026-08-19">Wednesday, August 19, 2026</time></li>
          <li>
              <time class="event-time-localized-start" datetime="2026-08-19">8:30 AM</time>
              <time class="event-time-localized-end" datetime="2026-08-19">10:00 AM</time>
          </li>
        </ul>
          <div class="eventlist-description"><div><div>
            <p>Join us for coffee and networking.</p>
          </div></div></div>
`;

describe("parseLrvCalendarHtml", () => {
  it("reads title, date, times, venue, and address", () => {
    const [event] = parseLrvCalendarHtml(marketHtml);
    assert.equal(event.title, "Roscoe Village Farmers Market");
    assert.equal(event.date, "2026-08-16");
    assert.equal(event.startTime, "09:00");
    assert.equal(event.endTime, "13:00");
    assert.equal(event.venue, "Hamlin Park");
    assert.match(event.address, /3035 North Hoyne/);
    assert.equal(
      event.sourceUrl,
      "https://www.lakeviewroscoevillage.org/events-calendar/roscoe-village-farmers-market-3-lxeat",
    );
  });
});

describe("isKidFriendlyLocalEvent", () => {
  it("keeps markets, fests, and playdates", () => {
    assert.equal(
      isKidFriendlyLocalEvent({ title: "Roscoe Village Farmers Market" }),
      true,
    );
    assert.equal(
      isKidFriendlyLocalEvent({ title: "Lakeview Taco Fest" }),
      true,
    );
    assert.equal(
      isKidFriendlyLocalEvent({
        title: "ChooChoo Chicago Grand Opening & Community Playdate",
      }),
      true,
    );
  });

  it("skips chamber networking and adult nights", () => {
    assert.equal(
      isKidFriendlyLocalEvent({ title: "Coffee & Commerce" }),
      false,
    );
    assert.equal(
      isKidFriendlyLocalEvent({ title: "Show & Tell for Grown-Ups" }),
      false,
    );
    assert.equal(
      isKidFriendlyLocalEvent({ title: "Network on the River" }),
      false,
    );
  });
});

describe("normalizeLrvEvent", () => {
  it("publishes Hamlin Park market rows with stable local ids", () => {
    const [event] = parseLrvCalendarHtml(marketHtml);
    const result = normalizeLrvEvent(event);
    assert.equal(result.skipReason, null);
    assert.equal(
      result.activity.id,
      localActivityId("lrvcc", "roscoe-village-farmers-market", "2026-08-16"),
    );
    assert.equal(result.activity.status, "published");
    assert.equal(result.activity.neighborhood, "Roscoe Village");
  });

  it("skips adult networking events", () => {
    const [event] = parseLrvCalendarHtml(coffeeHtml);
    const result = normalizeLrvEvent(event);
    assert.equal(result.skipReason, "not-kid-audience");
    assert.equal(result.activity, null);
  });

  it("skips ticketed events", () => {
    assert.equal(
      isPaidLocalEvent({
        title: "Cinema Femme Preview",
        description: "For a $50 ticket, enjoy a catered social hour.",
      }),
      true,
    );
  });
});

describe("recurring local sources", () => {
  it("generates remaining Green City Market Lincoln Park days", () => {
    const rows = generateGreenCityMarketLincoln(new Date("2026-08-15T12:00:00Z"));
    assert.ok(rows.length > 20);
    assert.equal(rows[0].activity.date >= "2026-08-15", true);
    assert.equal(rows.at(-1).activity.date, "2026-11-21");
    assert.equal(rows[0].activity.neighborhood, "Lincoln Park");
    assert.equal(rows[0].activity.id.startsWith("local:gcm-lincoln:"), true);
    const days = new Set(
      rows.map((row) => new Date(`${row.activity.date}T00:00:00Z`).getUTCDay()),
    );
    assert.deepEqual([...days].sort(), [3, 6]);
  });

  it("generates Roscoe Books Thursdays and skips July–August", () => {
    const rows = generateRoscoeBooksStoryTime(new Date("2026-08-15T12:00:00Z"));
    assert.equal(rows[0].activity.date, "2026-09-03");
    assert.equal(
      rows.every((row) => {
        const month = Number(row.activity.date.slice(5, 7));
        return month !== 7 && month !== 8;
      }),
      true,
    );
    assert.equal(rows[0].activity.neighborhood, "Roscoe Village");
    assert.equal(inferNeighborhood("Roscoe Books", "2142 W Roscoe St"), "Roscoe Village");
  });
});

describe("local source helpers", () => {
  it("builds month list URLs and weekday ranges", () => {
    assert.equal(
      buildLrvCalendarUrl("09-2026"),
      "https://www.lakeviewroscoevillage.org/events-calendar?view=list&month=09-2026",
    );
    assert.deepEqual(upcomingMonthKeys(new Date("2026-08-15T12:00:00Z"), 2), [
      "08-2026",
      "09-2026",
    ]);
    assert.deepEqual(weekdayDates("2026-09-01", "2026-09-10", [4]), [
      "2026-09-03",
      "2026-09-10",
    ]);
  });
});
