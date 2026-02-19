-- Combined migrations for Supabase
-- Run in Dashboard → SQL Editor → New query
-- https://supabase.com/dashboard/project/_/sql
--

-- ========== 20250206000000_phase2_enrollments.sql ==========
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


-- ========== 20250206100000_phase3_paths_sessions.sql ==========
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


-- ========== 20250206200000_phase4_admin_roles.sql ==========
-- Phase-4: User roles (student/admin) and admin-only write for paths/sessions.
-- Run after Phase-2 and Phase-3 migrations.
-- Students are read-only on learning_paths, levels, sessions; only admins can create/update/delete.

-- Profiles: one row per user, stores role.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile only.
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- New users get a profile with role student (insert only; no update by user).
create policy "Users can insert own profile as student"
  on public.profiles for insert
  with check (auth.uid() = id and role = 'student');

-- Function: true if current user is admin. Must exist before policies that use it.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Only admins can update profiles (e.g. promote to admin).
create policy "Admins can update profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Trigger: create profile with role student when a new user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'student')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for existing users (if any) so they can log in and have a role.
insert into public.profiles (id, role)
select id, 'student' from auth.users
on conflict (id) do nothing;

-- RLS: only admins can insert/update/delete learning_paths, levels, sessions.
create policy "Admins can insert learning_paths"
  on public.learning_paths for insert
  with check (public.is_admin());

create policy "Admins can update learning_paths"
  on public.learning_paths for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete learning_paths"
  on public.learning_paths for delete
  using (public.is_admin());

create policy "Admins can insert levels"
  on public.levels for insert
  with check (public.is_admin());

create policy "Admins can update levels"
  on public.levels for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete levels"
  on public.levels for delete
  using (public.is_admin());

create policy "Admins can insert sessions"
  on public.sessions for insert
  with check (public.is_admin());

create policy "Admins can update sessions"
  on public.sessions for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete sessions"
  on public.sessions for delete
  using (public.is_admin());

-- Optional: updated_at on profiles
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- To promote a user to admin, run in SQL Editor (replace with your user id or use auth.uid() when logged in):
-- update public.profiles set role = 'admin' where id = auth.uid();


-- ========== 20250206300000_phase5_announcements_questions.sql ==========
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


-- ========== 20250206400000_phase6_rbac_roles.sql ==========
-- Phase-6: RBAC — multiple roles, teacher assignments.
-- Run after Phase-4. Adds roles array, module_teachers, and extends profiles.

-- Extend role check to include teacher and director
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('student','teacher','admin','director'));

-- Add roles column (array) for multi-role support. Keep role for backward compat.
alter table public.profiles
  add column if not exists roles text[] default array['student']::text[];

-- Backfill roles from existing role column
update public.profiles
set roles = array[role]::text[]
where roles is null or array_length(roles, 1) is null;

-- Ensure default
alter table public.profiles
  alter column roles set default array['student']::text[];

-- Constraint: roles must be valid
alter table public.profiles
  drop constraint if exists profiles_roles_check;
alter table public.profiles
  add constraint profiles_roles_check
  check (roles <@ array['student','teacher','admin','director']::text[]);

-- Helper: true if current user is admin OR director (create before policies)
create or replace function public.is_admin_or_director()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and (role in ('admin','director') or roles && array['admin','director'])
  );
$$;

-- Extend is_admin to also check roles array and director
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_admin_or_director();
$$;

-- Module teachers: which teachers are assigned to which modules
create table if not exists public.module_teachers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_slug text not null,
  created_at timestamptz not null default now(),
  unique(user_id, module_slug)
);

alter table public.module_teachers enable row level security;

-- Anyone authenticated can read module_teachers (for "who teaches this module" display)
create policy "Authenticated can read module_teachers"
  on public.module_teachers for select
  to authenticated
  using (true);

-- Only admins/directors can mutate (assign teachers)
create policy "Admins can insert module_teachers"
  on public.module_teachers for insert
  with check (public.is_admin_or_director());

create policy "Admins can update module_teachers"
  on public.module_teachers for update
  using (public.is_admin_or_director())
  with check (public.is_admin_or_director());

create policy "Admins can delete module_teachers"
  on public.module_teachers for delete
  using (public.is_admin_or_director());


-- ========== 20250207000000_phase7_hardening.sql ==========
-- Phase-7: System Hardening — roles-only, modules table, module_id, live sessions.
-- Run after Phase-6. Requires module_teachers to exist (from Phase-6).

-- =============================================================================
-- 1. MODULES TABLE (id UUID, slug for display)
-- =============================================================================
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.modules enable row level security;

create policy "Anyone can read modules"
  on public.modules for select using (true);

-- Seed from constants
insert into public.modules (slug, title, sort_order)
values
  ('tafseer', 'Tafseer', 1),
  ('ahadees', 'Ahadees', 2),
  ('fiqah', 'Fiqah', 3),
  ('tajweed', 'Tajweed', 4),
  ('seerat-e-tayyabah', 'Seerat-e-Tayyabah', 5),
  ('sunnat-e-rasul', 'Sunnat-e-Rasul', 6),
  ('zikar', 'Zikar', 7),
  ('zikar-e-lataif', 'Zikar-e-Lataif', 8),
  ('muraqbah', 'Muraqbah', 9)
on conflict (slug) do nothing;

-- =============================================================================
-- 2. MODULE_SESSIONS (live sessions with status, zoom_link)
-- =============================================================================
create table if not exists public.module_sessions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  date date not null,
  "time" time,
  zoom_link text,
  topic text,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.module_sessions enable row level security;
create index idx_module_sessions_module_id on public.module_sessions(module_id);

create policy "Anyone can read module_sessions"
  on public.module_sessions for select using (true);

-- =============================================================================
-- 3. MODULE_ATTENDANCE
-- =============================================================================
create table if not exists public.module_attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.module_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'absent' check (status in ('present', 'absent')),
  created_at timestamptz not null default now(),
  unique(session_id, user_id)
);

alter table public.module_attendance enable row level security;
create index idx_module_attendance_session_id on public.module_attendance(session_id);

create policy "Anyone authenticated can read module_attendance"
  on public.module_attendance for select to authenticated using (true);

-- =============================================================================
-- 4. MODULE_ANNOUNCEMENTS
-- =============================================================================
create table if not exists public.module_announcements (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  content text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.module_announcements enable row level security;
create index idx_module_announcements_module_id on public.module_announcements(module_id);

create policy "Anyone can read module_announcements"
  on public.module_announcements for select using (true);

-- =============================================================================
-- 5. MODULE_RESOURCES
-- =============================================================================
create table if not exists public.module_resources (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  type text not null check (type in ('pdf', 'link', 'file')),
  url text not null,
  created_at timestamptz not null default now()
);

alter table public.module_resources enable row level security;
create index idx_module_resources_module_id on public.module_resources(module_id);

create policy "Anyone can read module_resources"
  on public.module_resources for select using (true);

-- =============================================================================
-- 6. MIGRATE module_teachers: module_slug → module_id
-- =============================================================================
-- Create new table with module_id
create table if not exists public.module_teachers_new (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, module_id)
);

-- Migrate data from module_teachers (module_slug) to module_teachers_new (module_id)
insert into public.module_teachers_new (user_id, module_id)
select mt.user_id, m.id
from public.module_teachers mt
join public.modules m on m.slug = mt.module_slug
on conflict (user_id, module_id) do nothing;

-- Drop old table and rename
drop table if exists public.module_teachers;
alter table public.module_teachers_new rename to module_teachers;

alter table public.module_teachers enable row level security;

create policy "Authenticated can read module_teachers"
  on public.module_teachers for select to authenticated using (true);

create policy "Admins can insert module_teachers"
  on public.module_teachers for insert with check (public.is_admin_or_director());

create policy "Admins can update module_teachers"
  on public.module_teachers for update
  using (public.is_admin_or_director()) with check (public.is_admin_or_director());

create policy "Admins can delete module_teachers"
  on public.module_teachers for delete using (public.is_admin_or_director());

-- =============================================================================
-- 7. REMOVE LEGACY role COLUMN — use only roles[]
-- =============================================================================
-- Ensure roles exists and is populated (Phase 6 may have added it)
update public.profiles set roles = array['student']::text[]
where roles is null or array_length(roles, 1) is null;

-- Drop old insert policy that references role
drop policy if exists "Users can insert own profile as student" on public.profiles;

-- Create new insert policy using roles only
create policy "Users can insert own profile as student"
  on public.profiles for insert
  with check (auth.uid() = id and roles = array['student']::text[]);

-- Update handle_new_user to use roles only
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, roles)
  values (new.id, array['student']::text[])
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop role column (profiles may have been created with role)
alter table public.profiles drop column if exists role;

-- Ensure roles has default and is not null
alter table public.profiles
  alter column roles set default array['student']::text[];
alter table public.profiles alter column roles set not null;

-- Update is_admin_or_director to use only roles
create or replace function public.is_admin_or_director()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and roles && array['admin','director']
  );
$$;

-- Update is_admin for legacy policy compatibility
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_admin_or_director();
$$;

-- Drop legacy role check constraint if exists
alter table public.profiles drop constraint if exists profiles_role_check;

-- Protect Director role: only Director can add/remove director role
create or replace function public.check_director_modification()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target_has_director boolean;
  current_is_director boolean;
begin
  target_has_director := new.roles @> array['director'];
  current_is_director := exists (
    select 1 from public.profiles where id = auth.uid() and roles @> array['director']
  );
  if target_has_director and not current_is_director then
    raise exception 'Only a Director can assign or modify the Director role';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_director_role on public.profiles;
create trigger protect_director_role
  before update on public.profiles
  for each row execute function public.check_director_modification();

-- updated_at trigger for module_sessions, module_announcements
drop trigger if exists module_sessions_updated_at on public.module_sessions;
create trigger module_sessions_updated_at
  before update on public.module_sessions
  for each row execute function public.set_updated_at();

drop trigger if exists module_announcements_updated_at on public.module_announcements;
create trigger module_announcements_updated_at
  before update on public.module_announcements
  for each row execute function public.set_updated_at();

-- =============================================================================
-- 7b. Enable Realtime for selective tables (run if Realtime not already enabled)
-- =============================================================================
-- alter publication supabase_realtime add table module_sessions;
-- alter publication supabase_realtime add table module_announcements;
-- alter publication supabase_realtime add table module_attendance;

-- =============================================================================
-- 8. RLS for teacher writes (sessions, attendance, announcements, resources)
-- =============================================================================
-- Teachers can insert/update/delete module_sessions only for assigned modules
create or replace function public.is_teacher_of_module(p_module_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.module_teachers
    where user_id = auth.uid() and module_id = p_module_id
  );
$$;

create or replace function public.can_access_module_as_teacher(p_module_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_admin_or_director()
  or public.is_teacher_of_module(p_module_id);
$$;

-- Admins/directors/assigned teachers can write module_sessions
create policy "Teachers can insert module_sessions"
  on public.module_sessions for insert
  with check (public.can_access_module_as_teacher(module_id));

create policy "Teachers can update module_sessions"
  on public.module_sessions for update
  using (public.can_access_module_as_teacher(module_id))
  with check (public.can_access_module_as_teacher(module_id));

create policy "Teachers can delete module_sessions"
  on public.module_sessions for delete
  using (public.can_access_module_as_teacher(module_id));

-- Attendance: teachers of the module can insert/update
create policy "Teachers can insert module_attendance"
  on public.module_attendance for insert
  with check (
    exists (
      select 1 from public.module_sessions s
      where s.id = session_id and public.can_access_module_as_teacher(s.module_id)
    )
  );

create policy "Teachers can update module_attendance"
  on public.module_attendance for update
  using (
    exists (
      select 1 from public.module_sessions s
      where s.id = session_id and public.can_access_module_as_teacher(s.module_id)
    )
  );

-- Announcements
create policy "Teachers can insert module_announcements"
  on public.module_announcements for insert
  with check (public.can_access_module_as_teacher(module_id));

create policy "Teachers can update module_announcements"
  on public.module_announcements for update
  using (public.can_access_module_as_teacher(module_id));

create policy "Teachers can delete module_announcements"
  on public.module_announcements for delete
  using (public.can_access_module_as_teacher(module_id));

-- Resources
create policy "Teachers can insert module_resources"
  on public.module_resources for insert
  with check (public.can_access_module_as_teacher(module_id));

create policy "Teachers can update module_resources"
  on public.module_resources for update
  using (public.can_access_module_as_teacher(module_id));

create policy "Teachers can delete module_resources"
  on public.module_resources for delete
  using (public.can_access_module_as_teacher(module_id));


-- ========== 20250207100000_phase8_initial_role_policy.sql ==========
-- Phase-8: Allow users to set their initial role (student or teacher) after signup.
-- Run after Phase-7. Enables role selection on signup form.

-- Users can update their own profile to set roles to ['student'] or ['teacher'] only.
-- Admins/directors can still promote users via existing "Admins can update profiles" policy.
create policy "Users can set initial role"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and (
      roles = array['student']::text[]
      or roles = array['teacher']::text[]
    )
  );


-- ========== 20250207200000_phase9_role_request_approval.sql ==========
-- Phase-9: Role request and approval flow for Teacher/Admin.
-- Run after Phase-8. Teacher and Admin require backend approval.

-- Add role_request column: user's requested role (pending approval)
alter table public.profiles
  add column if not exists role_request text
  check (role_request is null or role_request in ('pending_teacher', 'pending_admin'));

-- Restrict "Users can set initial role" to student only; allow role_request for Teacher/Admin signup
-- Users can set role_request only when it is null (first-time request)
drop policy if exists "Users can set initial role" on public.profiles;
create policy "Users can set initial role"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and roles = array['student']::text[]
    and (
      role_request is null
      or role_request in ('pending_teacher', 'pending_admin')
    )
  );

-- Users can set role_request on own profile when it is null (one-time request)
create policy "Users can request teacher or admin role"
  on public.profiles for update
  using (auth.uid() = id and role_request is null)
  with check (
    auth.uid() = id
    and role_request in ('pending_teacher', 'pending_admin')
  );

-- Add full_name and email for display (Teacher Card, Approvals list)
alter table public.profiles
  add column if not exists full_name text;
alter table public.profiles
  add column if not exists email text;

-- Update handle_new_user to copy email from auth.users
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, roles, email)
  values (new.id, array['student']::text[], new.email)
  on conflict (id) do update set email = coalesce(public.profiles.email, excluded.email);
  return new;
end;
$$;


-- ========== 20250207300000_phase10_admin_read_profiles.sql ==========
-- Phase-10: Allow admins to read all profiles (for Pending Approvals, Reports).
-- Run after Phase-9. Requires is_admin_or_director to exist.

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin_or_director());


-- ========== 20250209000000_phase11_module_enrollments.sql ==========
-- Phase 11: Module enrollments — real enrollment data for learning modules.
-- Run after Phase-10.

CREATE TABLE public.module_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, user_id)
);

CREATE INDEX idx_module_enrollments_module_id ON public.module_enrollments(module_id);
CREATE INDEX idx_module_enrollments_user_id ON public.module_enrollments(user_id);

ALTER TABLE public.module_enrollments ENABLE ROW LEVEL SECURITY;

-- 1) Students: SELECT where auth.uid() = user_id
CREATE POLICY "Students can read own enrollments"
  ON public.module_enrollments FOR SELECT
  USING (auth.uid() = user_id);

-- 2) Teachers: SELECT where assigned to module
CREATE POLICY "Teachers can read enrollments for assigned modules"
  ON public.module_enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.module_teachers mt
      WHERE mt.user_id = auth.uid()
      AND mt.module_id = module_enrollments.module_id
    )
  );

-- 3) Admin / Director: full access
CREATE POLICY "Admins can read module_enrollments"
  ON public.module_enrollments FOR SELECT
  USING (public.is_admin_or_director());

CREATE POLICY "Admins can insert module_enrollments"
  ON public.module_enrollments FOR INSERT
  WITH CHECK (public.is_admin_or_director());

CREATE POLICY "Admins can update module_enrollments"
  ON public.module_enrollments FOR UPDATE
  USING (public.is_admin_or_director())
  WITH CHECK (public.is_admin_or_director());

CREATE POLICY "Admins can delete module_enrollments"
  ON public.module_enrollments FOR DELETE
  USING (public.is_admin_or_director());

-- 4) Insert: authenticated users can insert when user_id = auth.uid()
CREATE POLICY "Users can enroll self in module"
  ON public.module_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ========== 20250210000000_phase12_audit_and_soft_delete.sql ==========
-- Phase 12: Audit logs, soft delete, platform hardening.
-- Run after Phase-11.

-- =============================================================================
-- 1. SYSTEM_ACTIVITY_LOGS
-- =============================================================================
CREATE TABLE public.system_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role text,
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_system_activity_logs_actor_id ON public.system_activity_logs(actor_id);
CREATE INDEX idx_system_activity_logs_entity ON public.system_activity_logs(entity_type, entity_id);
CREATE INDEX idx_system_activity_logs_created_at ON public.system_activity_logs(created_at DESC);

ALTER TABLE public.system_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admin or director can read logs
CREATE POLICY "Admins can read system_activity_logs"
  ON public.system_activity_logs FOR SELECT
  USING (public.is_admin_or_director());

-- Service role / authenticated insert (from server actions as admin)
-- Allow insert for authenticated users (server will validate admin before logging)
CREATE POLICY "Authenticated can insert system_activity_logs"
  ON public.system_activity_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================================================
-- 2. SOFT DELETE — is_archived columns
-- =============================================================================
ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

ALTER TABLE public.module_sessions
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

ALTER TABLE public.module_enrollments
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

-- Index for filtering non-archived
CREATE INDEX IF NOT EXISTS idx_modules_is_archived ON public.modules(is_archived) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_module_sessions_is_archived ON public.module_sessions(is_archived) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_module_enrollments_is_archived ON public.module_enrollments(is_archived) WHERE is_archived = false;


-- ========== 20250211000000_manual_approve_director.sql ==========
-- Manual approval: Grant director role to danialfarooqi021@gmail.com
-- Run this migration or execute in Supabase SQL Editor to have at least 1 director.
-- Requires temporarily disabling the protect_director_role trigger.

alter table public.profiles disable trigger protect_director_role;

update public.profiles
set
  roles = (
    select array_agg(distinct r)
    from unnest(
      coalesce(roles, array['student']::text[]) || array['director']::text[]
    ) as r
  ),
  role_request = null
where email = 'danialfarooqi021@gmail.com';

alter table public.profiles enable trigger protect_director_role;


-- ========== 20250211100000_bootstrap_first_director.sql ==========
-- Bootstrap: Allow assigning the first director when no directors exist.
-- Prevents chicken-and-egg: normally only a Director can assign Director,
-- but the first director must be created by bootstrap/manual process.

create or replace function public.check_director_modification()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target_has_director boolean;
  current_is_director boolean;
  director_count int;
begin
  target_has_director := new.roles @> array['director'];
  if not target_has_director then
    return new;
  end if;

  -- Count directors before this update: others with director + (this row if it had director)
  select (
    (select count(*) from public.profiles where id != new.id and roles @> array['director'])
    + case when old.roles @> array['director'] then 1 else 0 end
  ) into director_count;

  -- Bootstrap: if no directors exist, allow this assignment (first director)
  if director_count = 0 then
    return new;
  end if;

  -- Otherwise: only a Director can add/remove director role
  current_is_director := exists (
    select 1 from public.profiles where id = auth.uid() and roles @> array['director']
  );
  if not current_is_director then
    raise exception 'Only a Director can assign or modify the Director role';
  end if;

  return new;
end;
$$;


-- ========== 20250212000000_realtime_profiles.sql ==========
-- Enable Realtime for profiles table (role approval live updates).
-- Users on /pending-approval will be redirected when admin approves their role.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
end $$;


-- ========== 20250213000000_module_enrollment_metadata.sql ==========
-- Add enrollment metadata to module_enrollments (full name, WhatsApp, country, city).

alter table public.module_enrollments
  add column if not exists full_name text,
  add column if not exists whatsapp text,
  add column if not exists country text,
  add column if not exists city text;


-- ========== 20250214000000_bayat_guidance_requests.sql ==========
-- Bayat and Guidance request tables for human review workflow.

-- Bayat requests
CREATE TABLE public.bayat_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  whatsapp text NOT NULL,
  country text,
  city text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'responded')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  response_notes text,
  responded_at timestamptz,
  responded_by uuid REFERENCES auth.users(id)
);

CREATE INDEX idx_bayat_requests_user_id ON public.bayat_requests(user_id);
CREATE INDEX idx_bayat_requests_status ON public.bayat_requests(status);

ALTER TABLE public.bayat_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bayat_requests"
  ON public.bayat_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bayat_requests"
  ON public.bayat_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read bayat_requests"
  ON public.bayat_requests FOR SELECT
  USING (public.is_admin_or_director());

CREATE POLICY "Admins can update bayat_requests"
  ON public.bayat_requests FOR UPDATE
  USING (public.is_admin_or_director())
  WITH CHECK (public.is_admin_or_director());

-- Guidance requests
CREATE TABLE public.guidance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  whatsapp text NOT NULL,
  country text,
  city text,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'responded')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  response_notes text,
  responded_at timestamptz,
  responded_by uuid REFERENCES auth.users(id)
);

CREATE INDEX idx_guidance_requests_user_id ON public.guidance_requests(user_id);
CREATE INDEX idx_guidance_requests_status ON public.guidance_requests(status);

ALTER TABLE public.guidance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own guidance_requests"
  ON public.guidance_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own guidance_requests"
  ON public.guidance_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read guidance_requests"
  ON public.guidance_requests FOR SELECT
  USING (public.is_admin_or_director());

CREATE POLICY "Admins can update guidance_requests"
  ON public.guidance_requests FOR UPDATE
  USING (public.is_admin_or_director())
  WITH CHECK (public.is_admin_or_director());


-- ========== 20250215000000_platform_news_events.sql ==========
-- Platform news (global announcements) and events.

-- Platform news: title, excerpt, body, date — for News & Updates on Home
CREATE TABLE public.platform_news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  published_at timestamptz NOT NULL DEFAULT now(),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_platform_news_published ON public.platform_news(published_at DESC);

ALTER TABLE public.platform_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform_news"
  ON public.platform_news FOR SELECT USING (true);

CREATE POLICY "Admins can insert platform_news"
  ON public.platform_news FOR INSERT WITH CHECK (public.is_admin_or_director());

CREATE POLICY "Admins can update platform_news"
  ON public.platform_news FOR UPDATE
  USING (public.is_admin_or_director())
  WITH CHECK (public.is_admin_or_director());

CREATE POLICY "Admins can delete platform_news"
  ON public.platform_news FOR DELETE USING (public.is_admin_or_director());

CREATE TRIGGER platform_news_updated_at
  BEFORE UPDATE ON public.platform_news
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Events: title, description, date, time, location — for events calendar
CREATE TABLE public.platform_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  event_date date NOT NULL,
  event_time time,
  location text,
  url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_platform_events_date ON public.platform_events(event_date);

ALTER TABLE public.platform_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform_events"
  ON public.platform_events FOR SELECT USING (true);

CREATE POLICY "Admins can insert platform_events"
  ON public.platform_events FOR INSERT WITH CHECK (public.is_admin_or_director());

CREATE POLICY "Admins can update platform_events"
  ON public.platform_events FOR UPDATE
  USING (public.is_admin_or_director())
  WITH CHECK (public.is_admin_or_director());

CREATE POLICY "Admins can delete platform_events"
  ON public.platform_events FOR DELETE USING (public.is_admin_or_director());

CREATE TRIGGER platform_events_updated_at
  BEFORE UPDATE ON public.platform_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ========== 20250216000000_notification_preferences.sql ==========
-- User notification preferences (email, etc.)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notify_announcements boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_events boolean NOT NULL DEFAULT true;

-- Allow users to update their own notification preferences
CREATE POLICY "Users can update own notification preferences"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
