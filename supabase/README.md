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
