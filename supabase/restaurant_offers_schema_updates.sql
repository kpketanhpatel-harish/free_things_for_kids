-- Relax restaurant_offers for real-world incomplete source data.
-- Safe to re-run. Run after staging_restaurant_offers.sql.

alter table public.restaurant_offers
  alter column neighborhood drop not null,
  alter column eligible_days drop not null,
  alter column eligible_hours drop not null,
  alter column offer_summary drop not null;

alter table public.restaurant_offers
  add column if not exists status text not null default 'published',
  add column if not exists address text,
  add column if not exists website text,
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists notes text,
  add column if not exists staging_id uuid references public.staging_restaurant_offers (id) on delete set null;

create index if not exists restaurant_offers_status_idx
  on public.restaurant_offers (status);

create index if not exists restaurant_offers_neighborhood_idx
  on public.restaurant_offers (neighborhood);

drop policy if exists "Public read restaurant offers" on public.restaurant_offers;
create policy "Public read published restaurant offers"
  on public.restaurant_offers for select
  to anon, authenticated
  using (status = 'published');
