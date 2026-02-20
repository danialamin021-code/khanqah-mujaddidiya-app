# Applying Migrations

## Option 1: Supabase CLI (recommended)

1. Install Supabase CLI: `npm install -g supabase`
2. Link your project: `supabase link --project-ref YOUR_PROJECT_REF`
3. Push migrations: `supabase db push`

## Option 2: Supabase Dashboard SQL Editor

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**
2. Run each migration file **in order**:
   - `supabase/migrations/20250219000000_hybrid_batch_status_completion.sql`
   - `supabase/migrations/20250219100000_analytics_views.sql`
   - `supabase/migrations/20250219200000_performance_indexes.sql`
3. After migrations, refresh analytics:
   ```sql
   SELECT refresh_analytics_views();
   ```

## Option 3: Local Supabase

If using local Supabase (`supabase start`):
```bash
supabase db reset
# or
supabase migration up
```
