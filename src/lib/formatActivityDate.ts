export function formatActivityDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${weekday}, ${formatted}`;
}
