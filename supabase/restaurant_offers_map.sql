-- Additive Kids Eat Free map + provenance columns.
-- Safe to re-run. Run in the Supabase SQL Editor before
-- `npm run import:foam-kids-eat-free`.

alter table public.restaurant_offers
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists last_checked date;

create index if not exists restaurant_offers_geo_idx
  on public.restaurant_offers (latitude, longitude)
  where latitude is not null and longitude is not null;
