-- Staging table for raw spreadsheet / scraper rows.
-- Run in Supabase SQL Editor before importing.

create extension if not exists pgcrypto;

create table if not exists public.staging_activities (
  id uuid primary key default gen_random_uuid(),
  event_name text,
  library_name text,
  event_link text,
  location text,
  time_raw text,
  date_raw text,
  age_range text,
  registration_required_raw text,
  registration_date text,
  notes text,
  source_sheet text not null default 'chicago_family_events_combined',
  row_hash text not null unique,
  raw jsonb,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists staging_activities_date_raw_idx
  on public.staging_activities (date_raw);

create index if not exists staging_activities_event_link_idx
  on public.staging_activities (event_link);

alter table public.staging_activities enable row level security;
-- No anon/authenticated policies: only service_role can read/write staging.
