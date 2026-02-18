-- Phase-5: Live announcements (admin-created, read-only for students) and private student questions (students see own only).
-- Run after Phase-4 migration.
-- No public discussions, chat, or community; all human-reviewed.

-- Live announcements: optional path_id and session_id for scope (null = global, path only, or path+session).
create table if not exists public.live_announcements (
  id uuid primary key default gen_random_uuid(),
  path_id uuid references public.learning_paths(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete cascade,
  title text not null,
  body text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint session_implies_path check (
    (session_id is null) or (path_id is not null)
  )
);

create index if not exists live_announcements_path_id on public.live_announcements(path_id);
create index if not exists live_announcements_session_id on public.live_announcements(session_id);

alter table public.live_announcements enable row level security;

create policy "Anyone can read live_announcements"
  on public.live_announcements for select using (true);

create policy "Admins can insert live_announcements"
  on public.live_announcements for insert with check (public.is_admin());

create policy "Admins can update live_announcements"
  on public.live_announcements for update using (public.is_admin()) with check (public.is_admin());

create policy "Admins can delete live_announcements"
  on public.live_announcements for delete using (public.is_admin());

drop trigger if exists live_announcements_updated_at on public.live_announcements;
create trigger live_announcements_updated_at
  before update on public.live_announcements
  for each row execute function public.set_updated_at();

-- Private student questions: students submit; admins respond. Students see only their own.
create table if not exists public.student_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  path_slug text,
  session_slug text,
  subject text not null,
  body text not null default '',
  status text not null default 'open' check (status in ('open', 'answered')),
  admin_response text,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_questions_user_id on public.student_questions(user_id);
create index if not exists student_questions_status on public.student_questions(status);

alter table public.student_questions enable row level security;

create policy "Users can insert own student_questions"
  on public.student_questions for insert with check (auth.uid() = user_id);

create policy "Users can read own student_questions"
  on public.student_questions for select using (auth.uid() = user_id);

create policy "Admins can read all student_questions"
  on public.student_questions for select using (public.is_admin());

create policy "Admins can update student_questions"
  on public.student_questions for update using (public.is_admin()) with check (public.is_admin());

-- Students cannot update (no policy); only admins can add response and set status.
drop trigger if exists student_questions_updated_at on public.student_questions;
create trigger student_questions_updated_at
  before update on public.student_questions
  for each row execute function public.set_updated_at();
