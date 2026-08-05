import type { Activity } from "@/types";

function daysFromToday(daysFromNow: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + daysFromNow);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const activities: Activity[] = [
  {
    id: "family-story-time",
    title: "Family Story Time",
    summary: "Stories, songs, and simple activities for young children.",
    icon: "📖",
    date: daysFromToday(0),
    startTime: "10:00",
    endTime: "11:00",
    venue: "Lakeview Library",
    neighborhood: "Lakeview",
    ageGroup: "Toddlers and preschoolers",
    registrationRequired: false,
    sourceUrl: "https://example.com/story-time",
  },
  {
    id: "toddler-sensory-play",
    title: "Toddler Sensory Play",
    summary: "Hands-on sensory stations and guided play for toddlers.",
    icon: "🤲",
    date: daysFromToday(0),
    startTime: "14:00",
    endTime: "15:00",
    venue: "Lincoln Park Library",
    neighborhood: "Lincoln Park",
    ageGroup: "Ages 1–3",
    registrationRequired: false,
    sourceUrl: "https://example.com/sensory-play",
  },
  {
    id: "kids-art-workshop",
    title: "Kids Art Workshop",
    summary: "A free creative art session for elementary-school children.",
    icon: "🎨",
    date: daysFromToday(1),
    startTime: "15:30",
    endTime: "16:30",
    venue: "Roscoe Village Community Center",
    neighborhood: "Roscoe Village",
    ageGroup: "Ages 6–10",
    registrationRequired: true,
    sourceUrl: "https://example.com/art-workshop",
  },
  {
    id: "family-music-in-the-park",
    title: "Family Music in the Park",
    summary: "A free outdoor music performance for the whole family.",
    icon: "🎵",
    date: daysFromToday(3),
    startTime: "17:00",
    endTime: "18:30",
    venue: "Lincoln Park",
    neighborhood: "Lincoln Park",
    ageGroup: "All ages",
    registrationRequired: false,
    sourceUrl: "https://example.com/music-in-the-park",
  },
];
