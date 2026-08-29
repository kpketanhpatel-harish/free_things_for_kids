export function normalizeOfferName(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/['’`]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeAddress(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[.,#]/g, " ")
    .replace(/\b(ave|avenue|st|street|dr|drive|blvd|rd|road|pkwy)\b/g, " ")
    .replace(/\b(apt|suite|ste|unit|ll|1st|2nd|3rd|ground|rooftop|patio)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function streetFingerprint(address) {
  const normalized = normalizeAddress(address);
  if (!normalized) return "";
  const match = normalized.match(
    /(\d+)\s*(?:-\s*\d+)?\s*(?:n|north|s|south|e|east|w|west)?\s*([a-z]+)/,
  );
  if (!match) return "";
  return `${match[1]}|${match[2]}`;
}

export function includesAll(haystack, needles) {
  const text = String(haystack ?? "");
  return (needles ?? []).every((needle) => text.includes(needle));
}

export function isSuburbanAddress(address) {
  return /(oak park|oak brook|naperville|rosemont|wheaton|downers grove|evanston|skokie|norridge|elmhurst|lombard|schaumburg|orland|tinley|aurora|geneva|st charles|arlington heights|highland park|libertyville|vernon hills|park ridge|brookfield|westmont|itasca|palatine|lake forest|lake zurich|oswego|frankfort|chicago ridge|niles|des plaines|oakbrook)/i.test(
    address ?? "",
  );
}

export function rowMatchesFoam(row, foam) {
  const name = normalizeOfferName(row.restaurant_name);
  const address = normalizeAddress(row.address);
  const match = foam.match ?? {};

  if (match.nameIncludes && !includesAll(name, match.nameIncludes)) {
    return false;
  }
  if (match.nameExcludes && match.nameExcludes.some((token) => name.includes(token))) {
    return false;
  }
  if (match.addressExcludes && match.addressExcludes.some((token) => address.includes(token))) {
    return false;
  }
  if (match.addressIncludes?.length) {
    if (!address) {
      if (!match.allowMissingAddress) return false;
    } else if (!includesAll(address, match.addressIncludes)) {
      return false;
    }
  }
  if (match.requireSameDays?.length) {
    const days = row.eligible_days ?? [];
    const overlaps = match.requireSameDays.some((day) => days.includes(day));
    if (!overlaps) return false;
  }
  if (match.neighborhood && row.neighborhood && row.neighborhood !== match.neighborhood) {
    // Neighborhood labels in the sheet are often wrong; only exclude when
    // the address also clearly points somewhere else.
    if (address && match.addressIncludes?.length) {
      return includesAll(address, match.addressIncludes);
    }
  }
  return true;
}

export function scoreExistingRow(row) {
  let score = 0;
  if (row.status === "published") score += 10;
  if (row.confirmed) score += 5;
  if (row.address && /\d/.test(row.address) && !isSuburbanAddress(row.address)) {
    score += 4;
  }
  if (
    row.eligible_hours &&
    !/^see offer details$/i.test(String(row.eligible_hours).trim())
  ) {
    score += 3;
  }
  if (Array.isArray(row.eligible_days) && row.eligible_days.length > 0) score += 1;
  if (row.website) score += 1;
  if (row.maximum_child_age) score += 1;
  return score;
}

export function chooseKeeper(rows) {
  return [...rows].sort((a, b) => {
    const byScore = scoreExistingRow(b) - scoreExistingRow(a);
    if (byScore !== 0) return byScore;
    return String(a.id).localeCompare(String(b.id));
  })[0];
}

export function mergeSourceName(existing, nextName) {
  const current = String(existing ?? "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  if (!current.includes(nextName)) current.push(nextName);
  return current.join("; ");
}

export function isWeakHours(value) {
  if (!value) return true;
  return /see offer details|12:00 am\s*[–-]\s*11:59 pm/i.test(String(value).trim());
}
