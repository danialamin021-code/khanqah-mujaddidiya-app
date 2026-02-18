# Phase-2 Setup & Local Testing – Khanqah Mujaddidiyya

Phase-2 adds **user authentication**, **enrollment**, **progress tracking**, and **profile** with logout. All testable locally.

---

## 1. Supabase setup

### 1.1 Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project (or use an existing one).
2. In **Project Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.2 Environment variables

Create `.env.local` in the project root (same folder as `package.json`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Replace with your actual URL and anon key.

### 1.3 Database tables and RLS

Run the migration in **Supabase Dashboard → SQL Editor → New query**. Paste the contents of:

**`supabase/migrations/20250206000000_phase2_enrollments.sql`**

Then click **Run**. This creates:

- `public.enrollments` (user_id, path_id, last_visited_session_id, …)
- `public.session_completions` (user_id, path_id, session_id, completed_at)
- RLS policies so users only see their own rows

### 1.4 Auth settings (optional)

In **Authentication → Providers → Email**, ensure **Email** is enabled. For local testing you can leave **Confirm email** off so sign-up works without email verification.

---

## 2. Run the app locally

```bash
cd "c:\laragon\www\Khanqah Mujaddidiya App"
npm install
npm run dev
```

Open **http://localhost:3000**. You should be redirected to `/home` (guest) or `/paths` (if already logged in).

---

## 3. Phase-2 local testing flow

Use this to verify Phase-2 end-to-end.

| Step | Action | What to check |
|------|--------|----------------|
| 1 | Open http://localhost:3000 | Redirects to `/home` (guest). Nav shows **Log in** (not Profile). |
| 2 | Click **Log in** in nav | Login page loads. |
| 3 | Click **Sign up** | Sign-up page loads. |
| 4 | Sign up with email + password (e.g. test@example.com, password ≥ 6 chars) | After sign-up: redirect to `/paths` or message to confirm email (if confirmation is on). |
| 5 | If you see **Confirm your email**: check inbox or turn off email confirmation in Supabase and sign up again. Then **Log in** with same email/password | Redirects to `/paths`. Nav shows **Profile** instead of Log in. |
| 6 | Go to **Paths** → open a path (e.g. Introduction to the Path) | Path detail loads. **Enroll in this path** button is visible. |
| 7 | Click **Enroll in this path** | Button text changes to **Enrolled — continue below**. |
| 8 | Reload the path detail page | Still shows **Enrolled — continue below** (persisted in Supabase). |
| 9 | Click a session (e.g. Welcome) | Session page loads. **Mark as complete** button is visible. |
| 10 | Click **Mark as complete** | Shows **✓ Completed**. |
| 11 | Go back to path detail (Paths → path) | Session shows **✓** instead of number. **Continue from: Welcome** link appears at top. |
| 12 | Reload path detail | Checkmarks and **Continue from** still correct (persisted). |
| 13 | Open **Profile** in nav | Shows email, **Enrolled paths** with path and progress (e.g. 1/3 sessions complete), **Log out** button. |
| 14 | Click **Log out** | Redirects to `/home`. Nav shows **Log in** again. |
| 15 | Open http://localhost:3000 again | As guest, redirects to `/home`. |

---

## 4. Without Supabase (Phase-1 only)

If `.env.local` is missing or has no Supabase vars:

- Root redirects to `/home`.
- Nav shows **Log in**; login/signup show an error when you submit (“Supabase is not configured…”).
- Path detail shows “Log in to enroll” or “Configure Supabase…”.
- Profile shows “Configure Supabase…” or “Log in to see your profile”.

No runtime crash; Phase-1 flows (browse paths, sessions, guidance, contact) still work.

---

## 5. Files added or changed in Phase-2

| Area | Files |
|------|--------|
| Auth | `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `middleware.ts`, `app/auth/callback/route.ts`, `app/login/page.tsx`, `app/signup/page.tsx`, `lib/hooks/use-user.ts` |
| Nav | `components/AppNav.tsx` (Log in / Profile), `app/page.tsx` (redirect when logged in) |
| Enrollment | `app/actions/enrollment.ts`, `components/EnrollButton.tsx`, `app/paths/[id]/page.tsx` |
| Progress | `app/actions/progress.ts`, `components/SessionProgress.tsx`, `app/paths/[id]/sessions/[sessionId]/page.tsx`, path detail checkmarks and “Continue from” |
| Profile | `app/profile/page.tsx`, `components/LogoutButton.tsx` |
| DB | `supabase/migrations/20250206000000_phase2_enrollments.sql` |
