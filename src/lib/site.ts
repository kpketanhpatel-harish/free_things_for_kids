export const SITE_URL = "https://www.thefreekidslist.com";
export const SITE_NAME = "The Free Kids List";
export const SITE_CITY = "Chicago";
export const SITE_AREA = "Lakeview, Roscoe Village, and Lincoln Park";
export const SITE_TAGLINE =
  "Find something free to do with your kids today.";
export const SITE_DESCRIPTION =
  "Free activities, events, and kids-eat-free deals near you—all in one place.";

export const TARGET_NEIGHBORHOODS = [
  "Lakeview",
  "Roscoe Village",
  "Lincoln Park",
] as const;

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
