const DATASET_URL = "https://data.cityofchicago.org/resource/vsdy-d8k7.json";

export const CPL_BRANCHES = [
  "Merlo",
  "Lincoln Belmont",
  "Lincoln Park",
];

const PAGE_SIZE = 1000;

const USER_AGENT =
  "Free-Kid-List/0.1 (https://github.com/kpketanhpatel-harish/free_things_for_kids)";

function kidAudienceWhere() {
  const clauses = ["BABIES", "TODDLERS", "PRESCHOOLERS", "KIDS", "TWEENS"].map(
    (token) => `upper(event_audiences) like '%${token}%'`,
  );
  return `(${clauses.join(" OR ")})`;
}

function locationWhere(branches) {
  const quoted = branches.map((name) => `'${name.replaceAll("'", "''")}'`);
  return `location_name in (${quoted.join(",")})`;
}

export function buildCplQuery({
  branches = CPL_BRANCHES,
  offset = 0,
  limit = PAGE_SIZE,
} = {}) {
  const where = [
    locationWhere(branches),
    "cancelled=false",
    kidAudienceWhere(),
  ].join(" AND ");

  const params = new URLSearchParams({
    $where: where,
    $order: "start",
    $limit: String(limit),
    $offset: String(offset),
  });

  return `${DATASET_URL}?${params.toString()}`;
}

async function fetchPage(url, appToken) {
  const headers = {
    Accept: "application/json",
    "User-Agent": USER_AGENT,
  };
  if (appToken) {
    headers["X-App-Token"] = appToken;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(
      `CPL dataset request failed (${response.status} ${response.statusText})`,
    );
  }
  return response.json();
}

export async function fetchCplEvents({
  branches = CPL_BRANCHES,
  appToken,
} = {}) {
  const events = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const url = buildCplQuery({ branches, offset, limit: PAGE_SIZE });
    const page = await fetchPage(url, appToken);
    if (!Array.isArray(page)) {
      throw new Error("CPL dataset did not return a JSON array");
    }
    events.push(...page);
    if (page.length < PAGE_SIZE) break;
  }

  return events;
}
