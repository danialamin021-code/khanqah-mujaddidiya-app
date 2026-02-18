-- Phase-10: Allow admins to read all profiles (for Pending Approvals, Reports).
-- Run after Phase-9. Requires is_admin_or_director to exist.

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin_or_director());
