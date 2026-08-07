-- Run this in the Supabase SQL Editor for project hshutolqhiimulzqgwgf

create table if not exists public.restaurant_offers (
  id text primary key,
  restaurant_name text not null,
  neighborhood text not null,
  eligible_days text[] not null,
  eligible_hours text not null,
  offer_summary text not null,
  adult_purchase_required boolean not null default true,
  maximum_child_age integer,
  dine_in_only boolean not null default true,
  confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.restaurant_offers enable row level security;

drop policy if exists "Public read restaurant offers" on public.restaurant_offers;
create policy "Public read restaurant offers"
  on public.restaurant_offers for select
  to anon, authenticated
  using (true);

-- Seed sample rows (safe to re-run)
insert into public.restaurant_offers (
  id, restaurant_name, neighborhood, eligible_days, eligible_hours,
  offer_summary, adult_purchase_required, maximum_child_age, dine_in_only, confirmed
) values
  (
    'lakeview-pizza-tuesday',
    'Lakeview Pizza',
    'Lakeview',
    array['Tuesday'],
    '4:00 PM–8:00 PM',
    'One free kids meal with the purchase of one adult entrée.',
    true,
    12,
    true,
    true
  ),
  (
    'roscoe-family-cafe-sunday',
    'Roscoe Family Café',
    'Roscoe Village',
    array['Sunday'],
    '11:00 AM–3:00 PM',
    'Children receive one free meal from the kids menu.',
    true,
    10,
    true,
    true
  ),
  (
    'lakeview-diner-thursday',
    'Lakeview Diner',
    'Lakeview',
    array['Thursday'],
    '11:00 AM–9:00 PM',
    'Kids eat free from the kids menu with one adult entrée.',
    true,
    12,
    true,
    true
  ),
  (
    'roscoe-bistro-wednesday',
    'Roscoe Bistro',
    'Roscoe Village',
    array['Wednesday'],
    '12:00 PM–8:00 PM',
    'Free kids entrée with purchase of any adult meal.',
    true,
    10,
    true,
    true
  ),
  (
    'lincoln-park-grill-weekdays',
    'Lincoln Park Grill',
    'Lincoln Park',
    array['Monday', 'Wednesday'],
    '5:00 PM–7:00 PM',
    'One free kids meal with each qualifying adult meal.',
    true,
    12,
    true,
    false
  )
on conflict (id) do update set
  restaurant_name = excluded.restaurant_name,
  neighborhood = excluded.neighborhood,
  eligible_days = excluded.eligible_days,
  eligible_hours = excluded.eligible_hours,
  offer_summary = excluded.offer_summary,
  adult_purchase_required = excluded.adult_purchase_required,
  maximum_child_age = excluded.maximum_child_age,
  dine_in_only = excluded.dine_in_only,
  confirmed = excluded.confirmed;
