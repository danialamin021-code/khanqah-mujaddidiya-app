# Phase 3: Deployment & Production Readiness

Phase 3 prepares the app for production deployment. Phase 1 (Testing & CI) and Phase 2 (Data & Reliability) should be complete.

---

## 1. Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All migrations applied (see [MIGRATIONS.md](./MIGRATIONS.md))
- [ ] Seed data run if needed (`npm run db:seed`)
- [ ] Build succeeds: `npm run build`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] At least one Director exists (see [BOOTSTRAP_FIRST_DIRECTOR.md](./BOOTSTRAP_FIRST_DIRECTOR.md))

---

## 2. Deploy to Vercel

### 2.1 Connect Repository

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project**.
3. Import your repository.
4. Framework preset: **Next.js** (auto-detected).

### 2.2 Environment Variables

Set these in Vercel → Project → Settings → Environment Variables:

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key (public) |
| `NEXT_PUBLIC_CONTACT_PHONE` | No | Contact page |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Contact page |
| `NEXT_PUBLIC_CONTACT_WHATSAPP` | No | Contact page |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Error monitoring |
| `SENTRY_ORG` | No | For Sentry source maps |
| `SENTRY_PROJECT` | No | For Sentry source maps |

**Do not** add `SUPABASE_SERVICE_ROLE_KEY` to Vercel unless you have a server-side use case. Keep it local for `db:seed` only.

### 2.3 Supabase Auth Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: Add `https://your-app.vercel.app/**` and `https://your-app.vercel.app/auth/callback`

### 2.4 Deploy

Click **Deploy**. Vercel will build and deploy. Subsequent pushes to `main` trigger automatic deployments.

See `scripts/deploy-steps.md` for manual commit/push commands if needed.

---

## 3. Post-Deployment

- [ ] Visit production URL and verify login/signup.
- [ ] Test core flows: paths, enrollment, profile.
- [ ] Confirm Supabase Auth redirects work (login → callback → dashboard).
- [ ] Add Sentry DSN for error monitoring (optional).

---

## 4. Custom Domain (Optional)

1. Vercel → Project → Settings → Domains.
2. Add your domain and follow DNS instructions.
3. Update Supabase Auth redirect URLs with the new domain.

---

## 5. Files Reference

| Area | Files |
|------|-------|
| Config | `next.config.ts`, `package.json` |
| Env | `.env.example` |
| Docs | [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) |
