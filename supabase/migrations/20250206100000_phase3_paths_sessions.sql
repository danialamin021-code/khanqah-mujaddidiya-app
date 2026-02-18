-- Phase-3: Learning paths and sessions in database.
-- Run in Supabase SQL Editor after Phase-2 migration.
-- path_id and session_id in enrollments/session_completions are slugs (text) matching learning_paths.slug and sessions.slug.

-- Learning paths (slug used in URLs and in enrollments.path_id).
create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  introduction text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Levels within a path (e.g. Beginner).
create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  path_id uuid not null references public.learning_paths(id) on delete cascade,
  title text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique(path_id, sort_order)
);

-- Sessions within a level. slug used in URLs and in session_completions.session_id.
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  path_id uuid not null references public.learning_paths(id) on delete cascade,
  level_id uuid not null references public.levels(id) on delete cascade,
  slug text not null,
  title text not null,
  type text not null check (type in ('reading', 'audio', 'practice', 'announcement')),
  description text default '',
  body text default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(path_id, slug)
);

-- RLS: paths, levels, sessions are readable by everyone (anon + authenticated). Writes reserved for service_role / future admin.
alter table public.learning_paths enable row level security;
alter table public.levels enable row level security;
alter table public.sessions enable row level security;

create policy "Anyone can read learning_paths"
  on public.learning_paths for select using (true);

create policy "Anyone can read levels"
  on public.levels for select using (true);

create policy "Anyone can read sessions"
  on public.sessions for select using (true);

-- Seed: same content as previous static data (intro + practice paths).
insert into public.learning_paths (slug, title, description, introduction, sort_order)
values
  ('intro', 'Introduction to the Path', 'A gentle beginning for those new to guided spiritual learning.', 'This path offers a short, human-written introduction to guided spiritual learning. Take your time. There is no rush.', 1),
  ('practice', 'Daily Practice', 'Short, human-led sessions for reflection and connection.', 'Daily practice is kept simple and calm. Each session is short and focused—reading, reflection, or a gentle practice.', 2)
on conflict (slug) do nothing;

-- Levels for intro path
insert into public.levels (path_id, title, sort_order)
select id, 'Beginner', 1 from public.learning_paths where slug = 'intro'
on conflict (path_id, sort_order) do nothing;

-- Sessions for intro path (Beginner)
insert into public.sessions (path_id, level_id, slug, title, type, description, sort_order)
select p.id, l.id, s.slug, s.title, s.type, s.description, s.sort_order
from public.learning_paths p
cross join lateral (select id from public.levels where path_id = p.id limit 1) l(id)
cross join (values
  ('welcome', 'Welcome', 'reading', 'A brief welcome and orientation.', 1),
  ('intention', 'Setting Intention', 'reading', 'Reflecting on intention.', 2),
  ('first-practice', 'First Practice', 'practice', 'A simple first practice.', 3)
) as s(slug, title, type, description, sort_order)
where p.slug = 'intro'
on conflict (path_id, slug) do nothing;

-- Levels for practice path
insert into public.levels (path_id, title, sort_order)
select id, 'Beginner', 1 from public.learning_paths where slug = 'practice'
on conflict (path_id, sort_order) do nothing;

-- Sessions for practice path (Beginner)
insert into public.sessions (path_id, level_id, slug, title, type, description, sort_order)
select p.id, l.id, s.slug, s.title, s.type, coalesce(s.description, ''), s.sort_order
from public.learning_paths p
cross join lateral (select id from public.levels where path_id = p.id limit 1) l(id)
cross join (values
  ('morning', 'Morning Reflection', 'reading', '', 1),
  ('breath', 'Breath Awareness', 'practice', '', 2),
  ('closing', 'Closing', 'reading', '', 3)
) as s(slug, title, type, description, sort_order)
where p.slug = 'practice'
on conflict (path_id, slug) do nothing;

-- updated_at trigger for learning_paths and sessions
drop trigger if exists learning_paths_updated_at on public.learning_paths;
create trigger learning_paths_updated_at
  before update on public.learning_paths
  for each row execute function public.set_updated_at();

drop trigger if exists sessions_updated_at on public.sessions;
create trigger sessions_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();
