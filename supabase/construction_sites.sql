-- Normalized construction watch sites for the app.
-- Run after staging_construction_sites.sql

create table if not exists public.construction_sites (
  id text primary key,
  site_id text not null,
  title text not null,
  summary text,
  address text,
  neighborhood text,
  latitude double precision,
  longitude double precision,
  project_type text,
  likely_machinery text,
  activity_status text,
  evidence_class text,
  active_start date,
  active_end date,
  viewing_suitability text,
  viewing_suitability_score integer,
  kid_interest_score integer,
  confidence_score integer,
  permit_project_ids text,
  source_url text,
  source_record_date date,
  last_checked date,
  work_description text,
  contractor_agency text,
  notes text,
  status text not null default 'draft',
  source_name text,
  staging_id uuid references public.staging_construction_sites (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists construction_sites_status_neighborhood_idx
  on public.construction_sites (status, neighborhood);

create index if not exists construction_sites_kid_interest_idx
  on public.construction_sites (kid_interest_score desc nulls last);

create index if not exists construction_sites_active_end_idx
  on public.construction_sites (active_end);

alter table public.construction_sites enable row level security;

drop policy if exists "Public read published construction sites" on public.construction_sites;
create policy "Public read published construction sites"
  on public.construction_sites for select
  to anon, authenticated
  using (status = 'published');
