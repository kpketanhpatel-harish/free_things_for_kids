import type { Activity } from "@/types";

export type AgeFilter =
  | "all"
  | "babies"
  | "preschool"
  | "kids"
  | "tweens";

export type TimeFilter = "all" | "morning" | "afternoon" | "evening";

export type SettingFilter = "all" | "indoor" | "outdoor";

export type ActivityTypeFilter =
  | "all"
  | "story"
  | "market"
  | "park"
  | "arts"
  | "movie"
  | "music"
  | "festival";

export const AGE_FILTERS: { value: AgeFilter; label: string }[] = [
  { value: "all", label: "Any age" },
  { value: "babies", label: "Babies & toddlers" },
  { value: "preschool", label: "Preschool" },
  { value: "kids", label: "Kids" },
  { value: "tweens", label: "Tweens" },
];

export const TIME_FILTERS: { value: TimeFilter; label: string }[] = [
  { value: "all", label: "Any time" },
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
];

export const SETTING_FILTERS: { value: SettingFilter; label: string }[] = [
  { value: "all", label: "In or out" },
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
];

export const TYPE_FILTERS: { value: ActivityTypeFilter; label: string }[] = [
  { value: "all", label: "Any type" },
  { value: "story", label: "Story time" },
  { value: "market", label: "Market" },
  { value: "park", label: "Park" },
  { value: "arts", label: "Arts" },
  { value: "movie", label: "Movie" },
  { value: "music", label: "Music" },
  { value: "festival", label: "Festival" },
];

function haystack(
  activity: Pick<Activity, "title" | "summary" | "venue"> & {
    ageGroup?: string;
  },
): string {
  return `${activity.title} ${activity.summary} ${activity.venue} ${activity.ageGroup ?? ""}`.toLowerCase();
}

export function matchesAgeFilter(
  ageGroup: string,
  filter: AgeFilter,
): boolean {
  if (filter === "all") return true;
  const text = ageGroup.toLowerCase();
  if (/all ages|family|everyone/.test(text)) return true;

  if (filter === "babies") {
    return /bab|infant|toddler|0\s*[–-]\s*[123]|ages?\s*[01]|1\s*[–-]\s*[34]/.test(
      text,
    );
  }
  if (filter === "preschool") {
    return /preschool|pre-k|prek|ages?\s*[2-5]|[2-5]\s*[–-]\s*[5-8]/.test(text);
  }
  if (filter === "kids") {
    return /kids|elementary|youth|school-age|ages?\s*[5-9]|[6-9]\s*[–-]|ages?\s*1[01]/.test(
      text,
    );
  }
  return /tween|teen|ages?\s*1[0-4]|middle school/.test(text);
}

export function activityTimeBucket(
  startTime?: string,
): TimeFilter | "unknown" {
  const match = startTime?.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "unknown";
  let hour = Number(match[1]);
  if (/pm/i.test(startTime ?? "") && hour < 12) hour += 12;
  if (/am/i.test(startTime ?? "") && hour === 12) hour = 0;
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export function matchesTimeFilter(
  startTime: string | undefined,
  filter: TimeFilter,
): boolean {
  if (filter === "all") return true;
  const bucket = activityTimeBucket(startTime);
  if (bucket === "unknown") return true;
  return bucket === filter;
}

export function activitySetting(
  activity: Pick<Activity, "title" | "summary" | "venue">,
): SettingFilter | "unknown" {
  const text = haystack(activity);
  const outdoor =
    /outdoor|park|market|garden|playground|festival|carnival|farmers|parade|hike|zoo|beach|trail/.test(
      text,
    );
  const indoor =
    /indoor|library|story time|museum|bookstore|community center|gym/.test(
      text,
    );
  if (outdoor && !indoor) return "outdoor";
  if (indoor && !outdoor) return "indoor";
  if (outdoor && indoor) return "unknown";
  return "unknown";
}

export function matchesSettingFilter(
  activity: Pick<Activity, "title" | "summary" | "venue">,
  filter: SettingFilter,
): boolean {
  if (filter === "all") return true;
  const setting = activitySetting(activity);
  if (setting === "unknown") return true;
  return setting === filter;
}

export function activityType(
  activity: Pick<Activity, "title" | "summary" | "venue">,
): ActivityTypeFilter {
  const text = haystack(activity);
  if (/story|rhyme|book|lap sit|lapsit/.test(text)) return "story";
  if (/market|farmers/.test(text)) return "market";
  if (/movie|film|screen/.test(text)) return "movie";
  if (/music|concert|sing|choir/.test(text)) return "music";
  if (/fest|festival|carnival|parade/.test(text)) return "festival";
  if (/art|craft|paint|draw/.test(text)) return "arts";
  if (/park|playground|outdoor|nature/.test(text)) return "park";
  return "all";
}

export function matchesTypeFilter(
  activity: Pick<Activity, "title" | "summary" | "venue">,
  filter: ActivityTypeFilter,
): boolean {
  if (filter === "all") return true;
  return activityType(activity) === filter;
}

export function compactAgeLabel(ageGroup: string): string {
  const trimmed = ageGroup.trim();
  if (!trimmed) return "All ages";
  if (trimmed.length <= 28) return trimmed;
  return `${trimmed.slice(0, 26).trim()}…`;
}

export function activityTags(
  activity: Activity,
): string[] {
  const tags: string[] = [];
  const setting = activitySetting(activity);
  if (setting === "indoor") tags.push("Indoor");
  if (setting === "outdoor") tags.push("Outdoor");
  if (activity.registrationRequired) tags.push("Registration required");
  else tags.push("Drop-in");
  return tags;
}

export type DiscoveryFilters = {
  age: AgeFilter;
  neighborhood: string;
  time: TimeFilter;
  setting: SettingFilter;
  type: ActivityTypeFilter;
};

export const EMPTY_FILTERS: DiscoveryFilters = {
  age: "all",
  neighborhood: "all",
  time: "all",
  setting: "all",
  type: "all",
};

export function filtersAreActive(filters: DiscoveryFilters): boolean {
  return (
    filters.age !== "all" ||
    filters.neighborhood !== "all" ||
    filters.time !== "all" ||
    filters.setting !== "all" ||
    filters.type !== "all"
  );
}

export function activityMatchesFilters(
  activity: Activity,
  filters: DiscoveryFilters,
): boolean {
  if (
    filters.neighborhood !== "all" &&
    activity.neighborhood !== filters.neighborhood
  ) {
    return false;
  }
  if (!matchesAgeFilter(activity.ageGroup, filters.age)) return false;
  if (!matchesTimeFilter(activity.startTime, filters.time)) return false;
  if (!matchesSettingFilter(activity, filters.setting)) return false;
  if (!matchesTypeFilter(activity, filters.type)) return false;
  return true;
}

export function isFamilyDiscoveryActivity(activity: Activity): boolean {
  const text = `${activity.title} ${activity.summary}`.toLowerCase();
  return !/onboarding|networking mixer|after.?hours|happy hour|chamber breakfast/.test(
    text,
  );
}

export function searchHaystack(activity: Activity): string {
  return [
    activity.title,
    activity.summary,
    activity.venue,
    activity.neighborhood,
    activity.ageGroup,
    activity.address,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function matchesSearchQuery(
  haystackText: string,
  query: string,
): boolean {
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return true;
  const normalized = haystackText.toLowerCase();
  return tokens.every((token) => normalized.includes(token));
}
