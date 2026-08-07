-- Run this in the Supabase SQL Editor for project hshutolqhiimulzqgwgf

create table if not exists public.activities (
  id text primary key,
  title text not null,
  summary text not null,
  icon text not null,
  date date not null,
  start_time text not null,
  end_time text,
  venue text not null,
  address text not null,
  neighborhood text not null,
  age_group text not null,
  registration_required boolean not null default false,
  source_url text not null,
  created_at timestamptz not null default now()
);

alter table public.activities enable row level security;

drop policy if exists "Public read activities" on public.activities;
create policy "Public read activities"
  on public.activities for select
  to anon, authenticated
  using (true);

-- Seed sample rows (safe to re-run)
insert into public.activities (
  id, title, summary, icon, date, start_time, end_time,
  venue, address, neighborhood, age_group, registration_required, source_url
) values
  (
    'family-story-time',
    'Family Story Time',
    'Stories, songs, and simple activities for young children.',
    '📖',
    current_date,
    '10:00',
    '11:00',
    'Lakeview Library',
    '1641 W Belmont Ave, Chicago, IL 60657',
    'Lakeview',
    'Toddlers and preschoolers',
    false,
    'https://example.com/story-time'
  ),
  (
    'toddler-sensory-play',
    'Toddler Sensory Play',
    'Hands-on sensory stations and guided play for toddlers.',
    '🤲',
    current_date,
    '14:00',
    '15:00',
    'Lincoln Park Library',
    '1150 W Fullerton Ave, Chicago, IL 60614',
    'Lincoln Park',
    'Ages 1–3',
    false,
    'https://example.com/sensory-play'
  ),
  (
    'kids-art-workshop',
    'Kids Art Workshop',
    'A free creative art session for elementary-school children.',
    '🎨',
    current_date + 1,
    '15:30',
    '16:30',
    'Roscoe Village Community Center',
    '2145 W Roscoe St, Chicago, IL 60618',
    'Roscoe Village',
    'Ages 6–10',
    true,
    'https://example.com/art-workshop'
  ),
  (
    'family-music-in-the-park',
    'Family Music in the Park',
    'A free outdoor music performance for the whole family.',
    '🎵',
    current_date + 3,
    '17:00',
    '18:30',
    'Lincoln Park',
    '2045 N Lincoln Park West, Chicago, IL 60614',
    'Lincoln Park',
    'All ages',
    false,
    'https://example.com/music-in-the-park'
  )
on conflict (id) do update set
  title = excluded.title,
  summary = excluded.summary,
  icon = excluded.icon,
  date = excluded.date,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  venue = excluded.venue,
  address = excluded.address,
  neighborhood = excluded.neighborhood,
  age_group = excluded.age_group,
  registration_required = excluded.registration_required,
  source_url = excluded.source_url;
