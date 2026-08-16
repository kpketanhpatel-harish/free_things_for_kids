export function activityDetailPath(id: string): string {
  return `/activities/${encodeURIComponent(id)}`;
}

export function decodeActivityId(raw: string): string {
  if (!raw) return raw;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
