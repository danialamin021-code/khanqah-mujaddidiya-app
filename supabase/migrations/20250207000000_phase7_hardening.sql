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
