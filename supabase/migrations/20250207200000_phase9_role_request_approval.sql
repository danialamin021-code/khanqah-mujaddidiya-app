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
