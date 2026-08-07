-- Relax activities for real-world incomplete source data.
-- Safe to re-run.

alter table public.activities
  alter column summary drop not null,
  alter column icon drop not null,
  alter column start_time drop not null,
  alter column venue drop not null,
  alter column address drop not null,
  alter column neighborhood drop not null,
  alter column age_group drop not null;

alter table public.activities
  add column if not exists status text not null default 'published',
  add column if not exists source_name text,
  add column if not exists notes text,
  add column if not exists end_date date,
  add column if not exists staging_id uuid references public.staging_activities (id) on delete set null;

create index if not exists activities_status_date_idx
  on public.activities (status, date);

create index if not exists activities_source_url_idx
  on public.activities (source_url);

-- Keep public read limited to published rows.
drop policy if exists "Public read activities" on public.activities;
create policy "Public read published activities"
  on public.activities for select
  to anon, authenticated
  using (status = 'published');
