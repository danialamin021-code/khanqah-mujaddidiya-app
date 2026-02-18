# Production Readiness Checklist

Before deploying to production, verify the following.

## Environment & Secrets

- [ ] **Supabase** – Production project created; migrations applied
- [ ] **Environment variables** – `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` set for production
- [ ] **Secrets** – No secrets, API keys, or tokens in code or committed files
- [ ] **Supabase RLS** – Row Level Security policies enabled and tested

## Database

- [ ] **Migrations** – All migrations run successfully on production DB
- [ ] **First Director** – At least one Director created (see [BOOTSTRAP_FIRST_DIRECTOR.md](./BOOTSTRAP_FIRST_DIRECTOR.md))
- [ ] **Backups** – Supabase backups configured (if available)

## Authentication

- [ ] **Auth providers** – Email/password or OAuth configured as needed
- [ ] **Email confirmation** – Configure if required (Supabase Auth settings)
- [ ] **Redirect URLs** – Production URLs allowed in Supabase Auth settings

## Application

- [ ] **Build** – `npm run build` succeeds
- [ ] **E2E tests** – Core flows verified (see [E2E_TESTING_CHECKLIST.md](./E2E_TESTING_CHECKLIST.md))
- [ ] **Error handling** – Graceful handling of missing/invalid data
- [ ] **Loading states** – No blank screens or infinite spinners

## Deployment

- [ ] **Hosting** – Vercel, Netlify, or other hosting configured
- [ ] **Domain** – Custom domain and SSL if needed
- [ ] **Environment** – Production env vars set in hosting platform

## Post-Launch

- [ ] **Monitoring** – Error tracking (e.g. Sentry) if desired
- [ ] **Logs** – Admin Activity Logs and System Health accessible
