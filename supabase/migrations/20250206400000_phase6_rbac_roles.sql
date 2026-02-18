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
