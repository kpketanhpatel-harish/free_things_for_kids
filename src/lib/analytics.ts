export function trackEvent(
  name: string,
  data?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (typeof window === "undefined") return;

  const payload: Record<string, string | number | boolean> = {};
  if (data) {
    for (const [key, value] of Object.entries(data)) {
      if (value != null) payload[key] = value;
    }
  }

  void import("@vercel/analytics").then((mod) => {
    const track = (
      mod as { track?: (event: string, data?: Record<string, unknown>) => void }
    ).track;
    track?.(name, payload);
  });
}
