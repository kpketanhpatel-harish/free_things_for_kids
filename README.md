This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Refreshing source data

Sheet imports stage raw rows, then optionally promote normalized rows into app tables. Full SQL setup and promotion rules live in [`supabase/README.md`](supabase/README.md).

```bash
# Chicago Public Library (Merlo, Lincoln Belmont, Lincoln Park)
npm run ingest:cpl -- --dry-run
npm run ingest:cpl -- --promote

# Activities spreadsheet
npm run import:activities -- --dry-run
npm run import:activities -- --promote

# Kids eat free
npm run import:restaurant-offers -- --dry-run
npm run import:restaurant-offers -- --promote

# Construction watch sites
npm run import:construction-sites -- --dry-run
npm run import:construction-sites -- --promote
```

Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Dry-run for CPL does not need those keys.

### Chicago Public Library ingest

Kid programs at **Merlo**, **Lincoln Belmont**, and **Lincoln Park** are pulled from the [Chicago Data Portal CPL events dataset](https://data.cityofchicago.org/Events/Chicago-Public-Library-Events/vsdy-d8k7), then staged and promoted into the existing `activities` table. Uptown is excluded. Wrigleyville maps to Lakeview.

```bash
npm run ingest:cpl -- --dry-run
npm run ingest:cpl -- --promote
```

A GitHub Action (`.github/workflows/ingest-cpl.yml`) runs this daily and on demand. Add repository secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional: `SOCRATA_APP_TOKEN` if the public dataset starts rate-limiting.

## Analytics (Vercel)

Page views and visitors are tracked with [Vercel Web Analytics](https://vercel.com/docs/analytics).

1. In the Vercel project, open **Analytics** and enable **Web Analytics**
2. Deploy a build that includes `@vercel/analytics` (already added in `src/app/layout.tsx`)
3. View visitors / pageviews in the project **Analytics** tab (data appears after production traffic)

## Feedback form (Supabase + email alert)

The header **Feedback** button opens a modal. Submissions are saved to the `feedback` table and emailed to **freekidlist@gmail.com**.

1. Run `supabase/feedback.sql` in the Supabase SQL Editor
2. Create a [Gmail App Password](https://myaccount.google.com/apppasswords) for `freekidlist@gmail.com` (2-Step Verification must be on)
3. Add to `.env.local` (and Vercel env for production):

```env
GMAIL_USER=freekidlist@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
FEEDBACK_NOTIFY_EMAIL=freekidlist@gmail.com
```

4. Restart `npm run dev`

View submissions anytime in **Table Editor → feedback**. If email env vars are missing, feedback still saves to Supabase.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
