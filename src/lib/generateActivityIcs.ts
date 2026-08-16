import type { Activity } from "@/types";

export type ActivityCalendarEvent = {
  title: string;
  description: string;
  location: string;
  sourceUrl: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
};

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatIcsLocalDateTime(date: string, time: string): string {
  const [year, month, day] = date.split("-");
  const [hours, minutes] = time.split(":");

  return `${year}${month}${day}T${hours}${minutes}00`;
}

function addOneHour(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + 60;
  const nextHours = Math.floor(totalMinutes / 60) % 24;
  const nextMinutes = totalMinutes % 60;

  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`;
}

function formatIcsUtcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function canGenerateActivityIcs(activity: Activity): boolean {
  return Boolean(activity.startTime && /^\d{2}:\d{2}$/.test(activity.startTime));
}

export function getActivityCalendarEvent(
  activity: Activity,
): ActivityCalendarEvent {
  if (!activity.startTime || !canGenerateActivityIcs(activity)) {
    throw new Error("Activity is missing a parseable start time");
  }

  const endTime = activity.endTime ?? addOneHour(activity.startTime);

  return {
    title: activity.title,
    description: [
      activity.summary,
      `Age group: ${activity.ageGroup}`,
      `Registration: ${activity.registrationRequired ? "Required" : "Not required"}`,
      `More info: ${activity.sourceUrl}`,
    ].join("\n"),
    location: [activity.venue, activity.address].filter(Boolean).join(", "),
    sourceUrl: activity.sourceUrl,
    startDate: activity.date,
    endDate: activity.date,
    startTime: activity.startTime,
    endTime,
  };
}

function toGoogleDates(event: ActivityCalendarEvent): string {
  const start = formatIcsLocalDateTime(event.startDate, event.startTime);
  const end = formatIcsLocalDateTime(event.endDate, event.endTime);
  return `${start}/${end}`;
}

/** Local wall time as ISO-like string without timezone (Outlook web accepts this). */
function toOutlookDateTime(date: string, time: string): string {
  return `${date}T${time}:00`;
}

export function buildGoogleCalendarUrl(activity: Activity): string {
  const event = getActivityCalendarEvent(activity);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: toGoogleDates(event),
    details: `${event.description}\n${event.sourceUrl}`,
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildOutlookCalendarUrl(activity: Activity): string {
  const event = getActivityCalendarEvent(activity);
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    body: `${event.description}\n${event.sourceUrl}`,
    location: event.location,
    startdt: toOutlookDateTime(event.startDate, event.startTime),
    enddt: toOutlookDateTime(event.endDate, event.endTime),
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function generateActivityIcs(activity: Activity): string {
  const event = getActivityCalendarEvent(activity);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Free Things for Kids Chicago//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${activity.id}@free-things-for-kids-chicago`,
    `DTSTAMP:${formatIcsUtcStamp(new Date())}`,
    `DTSTART:${formatIcsLocalDateTime(event.startDate, event.startTime)}`,
    `DTEND:${formatIcsLocalDateTime(event.endDate, event.endTime)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    `URL:${event.sourceUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.join("\r\n")}\r\n`;
}

export function getActivityIcsFilename(activity: Activity): string {
  return `${activity.id.replaceAll(":", "-")}.ics`;
}
