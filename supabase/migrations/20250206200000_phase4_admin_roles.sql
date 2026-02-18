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
