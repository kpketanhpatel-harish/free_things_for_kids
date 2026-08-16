@AGENTS.md

# The Free Kid List — agent notes

Neighborhood app for **free kids activities** in **Lakeview, Roscoe Village, and Lincoln Park**. Wrigleyville maps to Lakeview. Stack: Next.js 16 App Router, TypeScript UI, Supabase, Vercel. Ingest is **Node CLI `.mjs` scripts**, not in-request Next.js.

Owner: Ketan (PM). Prefer working in code: fetch → stage → promote, one source at a time.

## Product rules (do not casually change)

- **One source at a time.** Do not scrape a grab-bag of URLs as one crawler.
- **Keep existing tables:** `staging_activities` and `activities`. Additive columns only if needed. No schema redesign.
- **Neighborhood gate:** Lakeview / Roscoe Village / Lincoln Park → `published`. Anything else usable → `draft`. RLS hides drafts from the public app.
- **Kids + free.** Skip paid and adult-only. Suggested-donation neighborhood fests (Taste of Lincoln) are an explicit exception.
- **Do not scrape Instagram.** Linking an Instagram URL as `source_url` is OK.
- **Do not delete** rows that drop off a feed. Past events stay.
- **New source IDs must not overwrite sheet IDs.** Spreadsheet rows keep `activityIdFromLink(...)` hashes. Prefix new sources (`cpl:`, `cpd:`, `local:`).
- Downtown/citywide directories (Do312, Choose Chicago, Cultural Center, Millennium Park) are **last / maybe never**.

## Data flow

```
Source adapter          Normalize                 Staging                    App
──────────────          ─────────                 ───────                    ───
cpl  (Socrata JSON) ─┐
cpd  (Socrata JSON) ─┼─► { staging, activity, ─► staging_activities ─► activities
local (HTML + gen)  ─┘     skipReason }            upsert on row_hash       upsert on id
sheet CSV import ────────── normalizeSheetRow ──► same tables
```

1. Fetch or generate raw events.
2. Normalize to `{ staging, activity, skipReason }`.
3. Upsert kept rows into `staging_activities` on `row_hash`.
4. With `--promote`, upsert `activity` rows into `activities` on `id`, attaching `staging_id`.

Skipped rows (`not-free`, `not-kid-audience`, `cancelled`, `missing-required-fields`) never reach staging.

`--dry-run` prints counts and sample published titles and writes nothing.

## Commands

```bash
npm test
npm run ingest:cpl -- --dry-run
npm run ingest:cpl -- --promote
npm run ingest:cpd -- --dry-run
npm run ingest:cpd -- --promote
npm run ingest:local -- --dry-run
npm run ingest:local -- --promote
```

Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for anything other than dry-run. `loadEnv()` in `scripts/lib/env.mjs` fills from `.env.local` **without overriding** existing `process.env` (GitHub secrets win). Optional: `SOCRATA_APP_TOKEN`.

Do not print `.env.local` values.

SQL setup (run once in Supabase): `supabase/activities.sql`, `staging_activities.sql`, `activities_schema_updates.sql`. Details in `supabase/README.md`.

## File map

| Path | Role |
|---|---|
| `scripts/ingest.mjs` | CLI orchestrator: `--source cpl\|cpd\|local`, `--dry-run`, `--promote` |
| `scripts/lib/env.mjs` | Load `.env.local` without clobbering CI env |
| `scripts/lib/promoteActivities.mjs` | Staging upsert + optional promote; dedupe by activity id |
| `scripts/lib/normalizeActivity.mjs` | Neighborhoods, zips, sheet normalizer, `pickIcon` / `buildSummary` |
| `scripts/lib/chicagoDates.mjs` | Chicago calendar dates, weekday ranges, month keys |
| `scripts/lib/normalizeCplEvent.mjs` | CPL → canonical row |
| `scripts/lib/normalizeCpdActivity.mjs` | Park District → canonical row |
| `scripts/lib/normalizeLocalEvent.mjs` | LV/RV calendar + generated local recurrences |
| `scripts/lib/parseLrvCalendar.mjs` | Squarespace event-list HTML parser |
| `scripts/sources/cpl.mjs` | Chicago Data Portal CPL events |
| `scripts/sources/cpd.mjs` | Chicago Data Portal Park District activities |
| `scripts/sources/local.mjs` | LV/RV months + generated markets/story times/fest |
| `scripts/import-activities-sheet.mjs` | Original Google Sheet importer (same promote path) |
| `.github/workflows/ingest-cpl.yml` | Daily ingest (name: Ingest neighborhood activities) |
| `tests/normalize*.test.mjs` | `node --test` |

## Sources in production

### `cpl` — Chicago Public Library

- Feed: [CPL events dataset](https://data.cityofchicago.org/Events/Chicago-Public-Library-Events/vsdy-d8k7)
- Branches: **Merlo**, **Lincoln Belmont**, **Lincoln Park**. **Drop Uptown.**
- Kid audiences: Babies, Toddlers, Preschoolers, Kids, Tweens.
- Ids: `cpl:<event_id>`

### `cpd` — Chicago Park District

- Feed: [Park District activities](https://data.cityofchicago.org/d/tn7v-6rnw)
- Parks: Wrightwood, Hamlin (Hannibal), Trebes (Robert), Gill (Joseph), Donahue (Margaret)
- Free only (`fee='0'`). Skip Adult/Senior/Teen and **PG-13/R** movies. Include Youth / Early Childhood / All Ages and PG/G events.
- Ids: `cpd:<activity_id>`

### `local` — neighborhood sites

Mix of **fetched HTML** and **generated recurrences** (sites with no dated feed).

| Piece | What it does | Ids |
|---|---|---|
| LV/RV Chamber calendar | Fetches 12 Chicago months of [events-calendar](https://www.lakeviewroscoevillage.org/events-calendar) list HTML. Keep markets, fests, Halloween, story/family-ish titles. Skip chamber networking, ticketed nights. | `local:lrvcc:<slug>:<date>` |
| Green City Market Lincoln Park | Wed + Sat 7:00–13:00 through Nov 21, 1817 N Clark | `local:gcm-lincoln:market:<date>` |
| Lincoln Park Farmers Market | Sat 7:00–13:00 through Nov 21, Armitage & Orchard. **Link Instagram, do not scrape.** | `local:lp-farmers-market:market:<date>` |
| Roscoe Books story time | Thu 11:00, ages 1–4, skip July–August | `local:roscoe-books:story-time:<date>` |
| Three Avenues story time | Sat 10:00, toddlers/preschoolers. Link [threeavenuesbookshop.com](https://www.threeavenuesbookshop.com/) (their `/allevents` page is not a usable calendar). | `local:three-avenues:story-time:<date>` |
| Taste of Lincoln Avenue | Hardcoded 2026-07-24..26. **$10 suggested donation** (explicit exception). Kids carnival noted in summary. | `local:taste-of-lincoln:festival:<date>` |

Low-Line Market and RV Farmers Market come from the Chamber calendar, not separate scrapers.

## Identity

| Source | Activity `id` | Staging `row_hash` |
|---|---|---|
| Google Sheet | 16-char hash of link\|date\|name | 32-char hash of same |
| CPL | `cpl:<event_id>` | hash of that id |
| CPD | `cpd:<activity_id>` | hash of that id |
| Local | `local:<source>:<slug>:<date>` | hash of that id |

Never reuse sheet-style hashes for new feeds. Upserts are idempotent: re-running updates the same rows.

## Neighborhood inference

`scripts/lib/normalizeActivity.mjs`:

- Target names: Lakeview, Roscoe Village, Lincoln Park
- Alias: Wrigleyville → Lakeview
- Venue map (libraries, parks, markets, bookstores)
- Zip fallback: `60614` Lincoln Park, `60657` Lakeview, `60618` Roscoe Village
- Do **not** map `60613` (Uptown / Buena Park false positives)

## Schedule

`.github/workflows/ingest-cpl.yml` — display name **Ingest neighborhood activities**.

- Cron: `0 11 * * *` UTC (≈ 6:00 AM Chicago during CDT)
- Also `workflow_dispatch`
- Steps: CPL `--promote`, then CPD `--promote`, then local `--promote`
- Secrets: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, optional `SOCRATA_APP_TOKEN`
- Node 22, `actions/checkout@v6`, `actions/setup-node@v6`

## How to add a source

1. Prefer JSON/ICS/RSS over HTML. Generate recurrences only when the site has a stable weekly pattern and no dated feed.
2. Add `scripts/sources/<name>.mjs` + `scripts/lib/normalize<Name>.mjs`.
3. Return the same `{ staging, activity, skipReason }` shape. Prefix ids (`name:...`).
4. Register in `SOURCES` in `scripts/ingest.mjs` and add `ingest:<name>` in `package.json`.
5. Add tests under `tests/`. Run `npm test` and `npm run ingest:<name> -- --dry-run` before `--promote`.
6. Append a step to the GitHub workflow.
7. Extend venue/zip maps if the new venues would otherwise go `draft`.

## Intentionally not built

- Instagram scraping (LP Farmers Market is a generated series + Instagram link)
- Three Avenues live calendar scrape (page is not an event list)
- Do312, Choose Chicago, Cultural Center, Millennium Park (citywide / downtown)

## Tests

`npm test` runs `node --test`. ESLint on this machine is slow; tests are the reliable check.

## Known follow-ups (out of ingest scope unless asked)

- `src/lib/upcoming.ts` uses server local time; on Vercel that is UTC, so “today” can be wrong for Chicago.
- Taste of Lincoln 2027 dates are unknown; update the hardcoded list when posted.
- Sheet imports (`import:activities`, restaurant offers, construction sites) are separate pipelines; do not fold them into `ingest.mjs` unless asked.
