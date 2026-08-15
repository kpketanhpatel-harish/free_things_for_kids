const BASE_URL = "https://www.lakeviewroscoevillage.org";

export function decodeHtml(value) {
  if (value == null) return null;
  const trimmed = String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\u202f/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return trimmed || null;
}

function absoluteUrl(href) {
  if (!href) return null;
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (href.startsWith("/")) return `${BASE_URL}${href}`;
  return `${BASE_URL}/${href}`;
}

export function parseClock(text) {
  const raw = decodeHtml(text);
  if (!raw) return null;
  const match = raw.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function parseLrvCalendarHtml(html) {
  if (!html) return [];

  const blocks = String(html).split(/<h1 class="eventlist-title">/).slice(1);
  const events = [];

  for (const block of blocks) {
    const hrefMatch = block.match(
      /href="([^"]+)" class="eventlist-title-link"/,
    );
    const titleMatch = block.match(
      /class="eventlist-title-link"[^>]*>([\s\S]*?)<\/a>/,
    );
    const dateMatch = block.match(
      /class="event-date" datetime="(\d{4}-\d{2}-\d{2})"/,
    );
    const startMatch = block.match(
      /class="event-time-localized-start"[^>]*>([\s\S]*?)<\/time>/,
    );
    const endMatch = block.match(
      /class="event-time-localized-end"[^>]*>([\s\S]*?)<\/time>/,
    );
    const venueMatch = block.match(
      /eventlist-meta-address[\s\S]*?>\s*([^<]+)/,
    );
    const mapMatch = block.match(/maps\.google\.com\?q=([^"&]+)/i);
    const descriptionMatch = block.match(
      /class="eventlist-description">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/,
    );
    const categoryMatch = block.match(
      /<category>([^<]+)<\/category>/i,
    );

    const title = decodeHtml(titleMatch?.[1]);
    const date = dateMatch?.[1] ?? null;
    if (!title || !date) continue;

    const href = hrefMatch?.[1] ?? null;
    const address = mapMatch
      ? decodeURIComponent(mapMatch[1].replace(/\+/g, " "))
      : null;

    events.push({
      title,
      date,
      startTime: parseClock(startMatch?.[1]),
      endTime: parseClock(endMatch?.[1]),
      venue: decodeHtml(venueMatch?.[1]),
      address,
      sourceUrl: absoluteUrl(href),
      description: decodeHtml(descriptionMatch?.[1]),
      category: decodeHtml(categoryMatch?.[1]),
    });
  }

  return events;
}
