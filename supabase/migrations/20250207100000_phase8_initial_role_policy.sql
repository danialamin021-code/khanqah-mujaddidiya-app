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
