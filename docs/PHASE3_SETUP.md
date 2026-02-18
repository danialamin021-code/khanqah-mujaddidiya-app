# Phase-3 Setup – Learning Paths & Sessions from Database

Phase-3 moves paths and sessions from static data into Supabase. Enrollments and session completions (Phase-2) stay unchanged and use path/session **slugs** (e.g. `intro`, `welcome`).

---

## 1. Run the Phase-3 migration

1. Open **Supabase Dashboard** → your project → **SQL Editor** → **New query**.
2. Paste the full contents of **`supabase/migrations/20250206100000_phase3_paths_sessions.sql`**.
3. Click **Run**.

This will:

- Create **`learning_paths`** (slug, title, description, introduction, sort_order).
- Create **`levels`** (path_id, title, sort_order).
- Create **`sessions`** (path_id, level_id, slug, title, type, description, body, sort_order).
- Enable RLS: **read for everyone** (anon + authenticated), no write for app users.
- Seed **intro** and **practice** paths with Beginner level and sessions (same content as before).

---

## 2. What changed in the app

| Before (Phase 1–2) | After (Phase 3) |
|--------------------|-----------------|
| Paths/sessions from `data/paths.ts` | Paths/sessions from Supabase `learning_paths`, `levels`, `sessions` |
| Path URL: `/paths/intro` (id = slug) | Same: `/paths/intro` (slug from DB) |
| Session URL: `/paths/intro/sessions/welcome` | Same: slug from DB |
| `enrollments.path_id` = text slug | Unchanged |
| `session_completions.path_id`, `session_id` = text slugs | Unchanged |

- **Home**: Path preview from `getAllPaths()` (DB).
- **Paths list**: From `getAllPaths()`.
- **Path detail**: From `getPathBySlug(slug)` with levels and sessions; enrollment/progress still use path slug.
- **Session detail**: From `getSessionBySlugs(pathSlug, sessionSlug)`; body from `sessions.body` when set; mark complete / last visited use existing `session_completions`.
- **Profile**: Enrolled path titles and session counts from `getPathBySlug()` (DB).

---

## 3. Local testing

1. **Run migration** (step 1 above).
2. **Start app**: `npm run dev` → open http://localhost:3000.
3. **Paths**: Home and Paths list show “Introduction to the Path” and “Daily Practice”.
4. **Path detail**: Open a path → intro, Beginner level, session list; enroll (if logged in).
5. **Session detail**: Open a session → title, description, body (if set); Previous/Next; “Mark as complete” (if logged in).
6. **Progress**: Mark a session complete → path detail shows ✓; Profile shows “X/Y sessions complete”.
7. **Empty DB**: If migration not run, paths list and home preview show “No paths yet” and point to running the migration.

---

## 4. Adding or editing content

- **Paths/sessions**: Insert or update in Supabase (Table Editor or SQL). RLS allows only **read** from the app; writes are done with service role or in SQL Editor.
- **Session body**: Set `sessions.body` (text) to show content on the session page instead of the placeholder.
- **New path**: Insert into `learning_paths`, then `levels`, then `sessions`; use a unique `slug` for URLs and for `enrollments.path_id` / `session_completions.path_id` / `session_id`.

---

## 5. Files touched in Phase 3

| Area | Files |
|------|--------|
| DB | `supabase/migrations/20250206100000_phase3_paths_sessions.sql` |
| Data layer | `lib/data/paths.ts` (getAllPaths, getPathBySlug, getSessionBySlugs) |
| Pages | `app/home/page.tsx`, `app/paths/page.tsx`, `app/paths/[id]/page.tsx`, `app/paths/[id]/sessions/[sessionId]/page.tsx`, `app/profile/page.tsx` |

`data/paths.ts` is no longer used by the app; paths and sessions are read from Supabase only.
