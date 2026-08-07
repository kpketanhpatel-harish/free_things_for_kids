-- Staging table for raw kids-eat-free spreadsheet rows.
-- Run in Supabase SQL Editor before importing.

create extension if not exists pgcrypto;

create table if not exists public.staging_restaurant_offers (
  id uuid primary key default gen_random_uuid(),
  restaurant_name text,
  address text,
  website text,
  dates_of_offer text,
  time_of_offer text,
  offer text,
  offer_details text,
  source_name text,
  source_url text,
  retrieved_at text,
  source_sheet text not null default 'chicago_kids_restaurant_deals',
  row_hash text not null unique,
  raw jsonb,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists staging_restaurant_offers_restaurant_name_idx
  on public.staging_restaurant_offers (restaurant_name);

alter table public.staging_restaurant_offers enable row level security;
-- No anon/authenticated policies: only service_role can read/write staging.
