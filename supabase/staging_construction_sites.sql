-- Staging table for Chicago heavy-machinery construction watch sheet rows.
-- Run in Supabase SQL Editor before importing.

create extension if not exists pgcrypto;

create table if not exists public.staging_construction_sites (
  id uuid primary key default gen_random_uuid(),
  site_id text,
  site_name text,
  address_limits text,
  neighborhood_raw text,
  latitude text,
  longitude text,
  project_type text,
  likely_machinery text,
  activity_evidence_class text,
  current_activity_status text,
  estimated_active_start text,
  estimated_active_end text,
  date_basis text,
  viewing_suitability text,
  viewing_suitability_score text,
  kid_interest_score text,
  confidence_score text,
  permit_project_ids text,
  source_urls text,
  source_record_date text,
  last_checked text,
  work_description text,
  contractor_agency text,
  notes text,
  source_sheet text not null default 'chicago_construction_watch_sites',
  row_hash text not null unique,
  raw jsonb,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists staging_construction_sites_site_id_idx
  on public.staging_construction_sites (site_id);

create index if not exists staging_construction_sites_neighborhood_raw_idx
  on public.staging_construction_sites (neighborhood_raw);

alter table public.staging_construction_sites enable row level security;
-- No anon/authenticated policies: only service_role can read/write staging.
