# Phase 2: Data & Reliability

## 1. Migrations (one-time)

1. Run `npm run db:apply` to generate `scripts/apply-migrations.sql`
2. Open [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard/project/_/sql)
3. Paste the contents of `scripts/apply-migrations.sql` and click **Run**

Or use Supabase CLI: `supabase db push`

## 2. Seed Data

Seed `platform_news` and `platform_events` for dev/test:

```bash
npm run db:seed
```

**Requires** `.env.local` with:

- `NEXT_PUBLIC_SUPABASE_URL` ✓ (already set)
- `SUPABASE_SERVICE_ROLE_KEY` — get from Supabase Dashboard → Settings → API → service_role (secret)

## 3. Sentry (Error Monitoring, optional)

1. Create a project at [sentry.io](https://sentry.io)
2. Add to `.env.local`:

```
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

3. `@sentry/nextjs` is installed. Errors are captured in `error.tsx` and `global-error.tsx`.

Without DSN, the app runs normally; Sentry is no-op.
