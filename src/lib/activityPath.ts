export function activityDetailPath(id: string): string {
  return `/activities/${encodeURIComponent(id)}`;
}

export function getActivityHref(activity: { id: string }): string {
  return activityDetailPath(activity.id);
}

export function decodeActivityId(raw: string): string {
  if (!raw) return raw;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
