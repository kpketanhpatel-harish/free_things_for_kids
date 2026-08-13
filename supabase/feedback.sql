-- Public feedback submissions from the in-app Feedback modal.
-- Run in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  feedback_type text not null
    check (feedback_type in ('feature', 'issue', 'general')),
  message text not null,
  email text,
  page_path text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_at_idx
  on public.feedback (created_at desc);

create index if not exists feedback_type_idx
  on public.feedback (feedback_type);

alter table public.feedback enable row level security;

-- Anyone can submit feedback; nobody (anon/authenticated) can read it.
-- View rows in the Supabase Table Editor (service role / dashboard).
drop policy if exists "Anyone can submit feedback" on public.feedback;
create policy "Anyone can submit feedback"
  on public.feedback for insert
  to anon, authenticated
  with check (
    char_length(message) > 0
    and char_length(message) <= 5000
    and (email is null or char_length(email) <= 320)
  );
