const DATASET_URL = "https://data.cityofchicago.org/resource/tn7v-6rnw.json";

export const CPD_PARKS = [
  "Wrightwood Park",
  "Hamlin (Hannibal) Park",
  "Trebes (Robert) Park",
  "Gill (Joseph) Park",
  "Donahue (Margaret) Park",
];

const PAGE_SIZE = 1000;

const USER_AGENT =
  "Free-Kid-List/0.1 (https://github.com/kpketanhpatel-harish/free_things_for_kids)";

function locationWhere(parks) {
  const quoted = parks.map((name) => `'${name.replaceAll("'", "''")}'`);
  return `location_facility in (${quoted.join(",")})`;
}

export function buildCpdQuery({
  parks = CPD_PARKS,
  offset = 0,
  limit = PAGE_SIZE,
} = {}) {
  const where = [locationWhere(parks), "fee='0'"].join(" AND ");

  const params = new URLSearchParams({
    $where: where,
    $order: "start_date",
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
      `Park District dataset request failed (${response.status} ${response.statusText})`,
    );
  }
  return response.json();
}

export async function fetchCpdActivities({
  parks = CPD_PARKS,
  appToken,
} = {}) {
  const activities = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const url = buildCpdQuery({ parks, offset, limit: PAGE_SIZE });
    const page = await fetchPage(url, appToken);
    if (!Array.isArray(page)) {
      throw new Error("Park District dataset did not return a JSON array");
    }
    activities.push(...page);
    if (page.length < PAGE_SIZE) break;
  }

  return activities;
}
