# Supabase setup

## 1. Create core tables (if not already done)

- `activities.sql`
- `restaurant_offers.sql`

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
