import type { Activity } from "@/types";

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

export function generateActivityIcs(activity: Activity): string {
  if (!activity.startTime || !canGenerateActivityIcs(activity)) {
    throw new Error("Activity is missing a parseable start time");
  }

  const endTime = activity.endTime ?? addOneHour(activity.startTime);
  const location = [activity.venue, activity.address].filter(Boolean).join(", ");
  const description = [
    activity.summary,
    `Age group: ${activity.ageGroup}`,
    `Registration: ${activity.registrationRequired ? "Required" : "Not required"}`,
    `More info: ${activity.sourceUrl}`,
  ].join("\\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Free Things for Kids Chicago//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${activity.id}@free-things-for-kids-chicago`,
    `DTSTAMP:${formatIcsUtcStamp(new Date())}`,
    `DTSTART:${formatIcsLocalDateTime(activity.date, activity.startTime)}`,
    `DTEND:${formatIcsLocalDateTime(activity.date, endTime)}`,
    `SUMMARY:${escapeIcsText(activity.title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `URL:${activity.sourceUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.join("\r\n")}\r\n`;
}

export function getActivityIcsFilename(activity: Activity): string {
  return `${activity.id}.ics`;
}
