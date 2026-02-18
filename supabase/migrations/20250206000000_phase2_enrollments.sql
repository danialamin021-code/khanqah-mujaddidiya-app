-- Phase-2: Enrollments and session progress.
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Local test: after running, enroll and mark sessions complete; reload to verify persistence.

-- Enrollments: one row per user per path. Tracks last visited session.
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  path_id text not null,
  last_visited_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, path_id)
);

-- Session completions: which sessions the user has marked complete.
create table if not exists public.session_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  path_id text not null,
  session_id text not null,
  completed_at timestamptz not null default now(),
  unique(user_id, path_id, session_id)
);

-- RLS: users can only read/write their own rows.
alter table public.enrollments enable row level security;
alter table public.session_completions enable row level security;

create policy "Users can manage own enrollments"
  on public.enrollments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own session_completions"
  on public.session_completions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Optional: updated_at trigger for enrollments.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists enrollments_updated_at on public.enrollments;
create trigger enrollments_updated_at
  before update on public.enrollments
  for each row execute function public.set_updated_at();
