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
