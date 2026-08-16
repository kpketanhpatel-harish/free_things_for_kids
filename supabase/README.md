# Supabase setup

## 1. Create core tables (if not already done)

- `activities.sql`
- `restaurant_offers.sql`
- `feedback.sql` (in-app Feedback modal submissions)

## 2. Staging + schema updates for sheet import

Run in order in the SQL Editor:

1. `staging_activities.sql`
2. `activities_schema_updates.sql`

## 3. Configure env

In `.env.local` add your service role key (Project Settings → API):

```env
SUPABASE_SERVICE_ROLE_KEY=...
```

## 4. Import from Google Sheet

```bash
# Preview only
npm run import:activities -- --dry-run

# Load staging only
npm run import:activities

# Load staging + promote into activities
npm run import:activities -- --promote
```

Promotion rules:

- Rows with enough data become `activities` records
- Lakeview / Roscoe Village / Lincoln Park → `status = published` (visible in the app)
- Other neighborhoods → `status = draft` (hidden by RLS)

## Chicago Public Library ingest

No extra SQL. Uses the existing `staging_activities` and `activities` tables.

```bash
npm run ingest:cpl -- --dry-run
npm run ingest:cpl -- --promote
```

Promotion rules:

- Kid-audience events at Merlo, Lincoln Belmont, and Lincoln Park
- Target neighborhoods → `published`; anything else usable → `draft`
- Activity ids are `cpl:<event_id>` and do not replace spreadsheet row ids

## Chicago Park District ingest

No extra SQL. Uses the existing `staging_activities` and `activities` tables.

```bash
npm run ingest:cpd -- --dry-run
npm run ingest:cpd -- --promote
```

Promotion rules:

- Free (`fee = 0`) events/programs at Wrightwood, Hamlin, Trebes, Gill, and Donahue
- Kid ages (All Ages, Early Childhood, Youth) or family events; skip Adult/Senior/Teen and PG-13/R movies
- Target neighborhoods → `published`
- Activity ids are `cpd:<activity_id>`

## Local neighborhood ingest

No extra SQL. Uses the existing `staging_activities` and `activities` tables.

```bash
npm run ingest:local -- --dry-run
npm run ingest:local -- --promote
```

Promotion rules:

- Lakeview/Roscoe Village Chamber calendar events that look kid/family (markets, fests, Halloween, story-adjacent community events)
- Generated remaining Green City Market Lincoln Park dates, Lincoln Park Farmers Market Saturdays, Roscoe Books Thursdays, Three Avenues Saturdays, and Taste of Lincoln Avenue (suggested donation)
- Skip adult networking and ticketed events; Instagram is used only as a source link, not scraped
- Target neighborhoods → `published`
- Activity ids are `local:<source>:<slug>:<date>` and do not replace spreadsheet, CPL, or Park District ids

Duplicate same-day events from the sheet and ingest are collapsed in the app and **drafted** (not deleted) after `--promote`. To clean existing rows without a full ingest:

```bash
npm run cleanup:duplicate-activities -- --dry-run
npm run cleanup:duplicate-activities
```

## Kids eat free / restaurant offers import

Run in order in the SQL Editor:

1. `staging_restaurant_offers.sql`
2. `restaurant_offers_schema_updates.sql`

Then:

```bash
npm run import:restaurant-offers -- --dry-run --promote
npm run import:restaurant-offers -- --promote
```

Promotion rules:

- All raw rows land in `staging_restaurant_offers`
- Normalized offers with target neighborhood + parseable days → `published`
- Everything else usable → `draft`
- `confirmed` defaults to `false` (aggregator sources)

## Construction watch sites import

Sheet: [Chicago Heavy-Machinery Construction Watch Sites](https://docs.google.com/spreadsheets/d/1wYDscLNSOgx58DkPafWqRN2m3HzqIrJevJFXOOdXgt0/edit?usp=sharing)

Run in order in the SQL Editor:

1. `staging_construction_sites.sql`
2. `construction_sites.sql`

Then:

```bash
# Preview only
npm run import:construction-sites -- --dry-run

# Load staging only
npm run import:construction-sites

# Load staging + promote into construction_sites
npm run import:construction-sites -- --promote
```

Promotion rules:

- All raw rows land in `staging_construction_sites`
- All normalized sites promote as `published` (browsable in the app)
- The `/construction-sites` page sorts Roscoe Village / Lakeview / Lincoln Park first
- Optional env overrides: `CONSTRUCTION_SHEET_ID`, `CONSTRUCTION_SHEET_GID`

## Feedback table

Run `feedback.sql` in the SQL Editor.

- Header **Feedback** modal posts to `/api/feedback`
- API inserts into `public.feedback` and emails `FEEDBACK_NOTIFY_EMAIL` (default `freekidlist@gmail.com`) via Gmail SMTP
- RLS: anon/authenticated can **insert** only; no public read
- Review rows in **Table Editor → feedback**
- Requires server env: `GMAIL_USER`, `GMAIL_APP_PASSWORD` (see root README)
