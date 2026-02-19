# CI Setup (GitHub Actions)

The CI workflow runs on push/PR to `main` or `master`.

## Jobs

1. **lint-and-build** – ESLint + Next.js build
2. **unit-tests** – Vitest
3. **e2e-tests** – Playwright (requires secrets)

## Required Secrets (for E2E)

Add these in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `TEST_USER_EMAIL` | E2E test user email (student) |
| `TEST_USER_PASSWORD` | E2E test user password |

The build job uses placeholder values if Supabase secrets are missing; E2E will fail without all four secrets.
