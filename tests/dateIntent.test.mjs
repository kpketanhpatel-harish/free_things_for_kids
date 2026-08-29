import assert from "node:assert/strict";
import { describe, it } from "node:test";

const CHICAGO = "America/Chicago";

function chicagoTodayYmd(now) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CHICAGO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function addDaysYmd(ymd, days) {
  const [year, month, day] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function weekdayIndexForYmd(ymd) {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function weekendDatesFor(todayYmd) {
  const day = weekdayIndexForYmd(todayYmd);
  if (day === 0) return [todayYmd];
  if (day === 6) return [todayYmd, addDaysYmd(todayYmd, 1)];
  const saturday = addDaysYmd(todayYmd, 6 - day);
  return [saturday, addDaysYmd(saturday, 1)];
}

function parseTimeToMinutes(value) {
  if (!value) return null;
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function hasActivityEnded(activity, nowYmd, nowMinutes) {
  if (activity.date < nowYmd) return true;
  if (activity.date > nowYmd) return false;
  const start = parseTimeToMinutes(activity.startTime);
  if (start == null) return false;
  const end = parseTimeToMinutes(activity.endTime) ?? start + 60;
  return nowMinutes >= end;
}

describe("date intent", () => {
  it("keeps Wednesday's weekend as the coming Saturday and Sunday", () => {
    assert.deepEqual(weekendDatesFor("2026-08-26"), [
      "2026-08-29",
      "2026-08-30",
    ]);
  });

  it("on Saturday includes today and Sunday", () => {
    assert.deepEqual(weekendDatesFor("2026-08-29"), [
      "2026-08-29",
      "2026-08-30",
    ]);
  });

  it("on Sunday is only Sunday, not next weekend", () => {
    assert.deepEqual(weekendDatesFor("2026-08-30"), ["2026-08-30"]);
  });

  it("hides an event after its end time on the same Chicago day", () => {
    const ended = hasActivityEnded(
      { date: "2026-08-24", startTime: "10:00", endTime: "11:00" },
      "2026-08-24",
      11 * 60,
    );
    const stillOn = hasActivityEnded(
      { date: "2026-08-24", startTime: "10:00", endTime: "11:00" },
      "2026-08-24",
      10 * 60 + 30,
    );
    assert.equal(ended, true);
    assert.equal(stillOn, false);
  });

  it("does not treat a future-date event as ended", () => {
    assert.equal(
      hasActivityEnded(
        { date: "2026-08-30", startTime: "09:00" },
        "2026-08-24",
        23 * 60,
      ),
      false,
    );
  });

  it("formats Chicago today as YYYY-MM-DD", () => {
    const ymd = chicagoTodayYmd(new Date("2026-08-24T18:00:00Z"));
    assert.match(ymd, /^\d{4}-\d{2}-\d{2}$/);
  });
});
