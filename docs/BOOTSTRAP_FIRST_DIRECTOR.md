# Bootstrap: Creating the First Director

The Director role is protected: only an existing Director can assign or modify the Director role. This creates a chicken-and-egg problem when setting up a new environment—you need a Director to create the first Director.

## Automatic Bootstrap (Recommended)

As of migration `20250211100000_bootstrap_first_director.sql`, the system allows assigning the Director role when **no directors exist**. This means:

1. **New deployments**: Run all migrations. The first director can be assigned via the Admin UI (Users → Edit roles) by any Admin, or via the Supabase SQL Editor, without disabling triggers.
2. **No manual trigger disable**: The `check_director_modification()` function now permits the first director assignment when `director_count = 0`.

## Manual Bootstrap (Legacy / SQL Editor)

If you need to run SQL directly (e.g. Supabase SQL Editor) and the bootstrap migration has not been applied:

```sql
-- 1. Disable the director protection trigger
ALTER TABLE public.profiles DISABLE TRIGGER protect_director_role;

-- 2. Grant director role to the user (replace email)
UPDATE public.profiles
SET
  roles = (
    SELECT array_agg(DISTINCT r)
    FROM unnest(
      coalesce(roles, array['student']::text[]) || array['director']::text[]
    ) AS r
  ),
  role_request = null
WHERE email = 'your-director@example.com';

-- 3. Re-enable the trigger
ALTER TABLE public.profiles ENABLE TRIGGER protect_director_role;
```

## Via Admin UI

Once at least one Director exists, new Directors can be assigned via:

1. **Admin** → **People** → **Users**
2. Find the user → **Edit** (or manage roles)
3. Add the **Director** role and save

Only Directors can assign or remove the Director role.

## Via Migration (One-Time)

The migration `20250211000000_manual_approve_director.sql` grants director to a specific email. It includes trigger disable/enable so it runs correctly. To use it for a different user, edit the `WHERE email = '...'` clause before running `supabase db push`.
