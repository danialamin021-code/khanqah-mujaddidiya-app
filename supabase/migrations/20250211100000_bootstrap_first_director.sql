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
