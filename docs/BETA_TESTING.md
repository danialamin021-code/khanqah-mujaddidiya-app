# Beta Testing Guide — Internal Team Access

Use this guide to prepare the app for internal team testing on Vercel.

---

## 1. Supabase Auth — Allow All Testers

In **Supabase Dashboard** → **Authentication** → **Providers** → **Email**:

| Setting | Action for Beta |
|---------|-----------------|
| **Confirm email** | Turn **OFF** — testers can sign up and log in immediately without clicking an email link |
| **Email allowlist** | Turn **OFF** (or add all team emails if you prefer) — any email can sign up |

---

## 2. Supabase Redirect URLs

In **Supabase Dashboard** → **Authentication** → **URL Configuration**:

- **Site URL**: `https://YOUR-APP.vercel.app` (your actual Vercel URL)
- **Redirect URLs**: Add:
  - `https://YOUR-APP.vercel.app/**`
  - `https://YOUR-APP.vercel.app/auth/callback`

---

## 3. Share with Your Team

1. **Share the Vercel URL** (e.g. `https://khanqah-mujaddidiya-app.vercel.app`)
2. **Testers go to** `/signup` to create an account
3. With email confirmation off, they can log in right after signup

---

## 4. Tester Flow

1. Open `https://YOUR-APP.vercel.app/signup`
2. Enter email, password, choose role (Student / Teacher / Admin)
3. Click Sign up → redirected to `/home` (Student) or `/pending-approval` (Teacher/Admin)
4. Log out and log in again at `/login` to verify

---

## 5. Before Production

When moving from beta to production:

- Turn **Confirm email** back **ON**
- Add **Email allowlist** if you want to restrict signups
- Review Supabase Auth logs for any issues
