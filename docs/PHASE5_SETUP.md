# Phase-5 Setup – Guided Interaction (Announcements & Questions)

Phase-5 adds **live session announcements** (admin-created, student read-only) and a **private question** system (students submit, admins respond; students see only their own). No public discussions, chat, or community.

---

## 1. Run the Phase-5 migration

1. Open **Supabase Dashboard** → your project → **SQL Editor** → **New query**.
2. Paste the full contents of **`supabase/migrations/20250206300000_phase5_announcements_questions.sql`**.
3. Click **Run**.

This will:

- Create **`live_announcements`**: optional `path_id`, `session_id` (scope: global, path, or session), `title`, `body`, `sort_order`. RLS: everyone can SELECT; only admins can INSERT/UPDATE/DELETE.
- Create **`student_questions`**: `user_id`, optional `path_slug`/`session_slug`, `subject`, `body`, `status` (open/answered), `admin_response`, `responded_at`. RLS: users can INSERT own row and SELECT only own rows; admins can SELECT all and UPDATE (to respond).

---

## 2. Live announcements

- **Admin:** **`/admin`** → **Announcements** → create/edit announcements. Scope: leave path/session empty for **global**; set path slug (e.g. `intro`) for **path-level**; set path + session slug for **session-level**.
- **Student:** Announcements appear on **session pages** (above session content), read-only. Order: session-specific first, then path-level, then global.

---

## 3. Private questions

- **Student:** **My questions** (nav) or **Ask a question** from a session page. Submit subject + body; optional context (path/session) is stored. Students see only their own questions and admin responses.
- **Admin:** **`/admin`** → **Questions** → list all questions, open a question to add or edit **Your response** and set status to **Answered**.

RLS ensures students cannot see other students’ questions or update any row; only admins can update (respond).

---

## 4. Local testing checklist

1. **Run Phase-5 migration** in Supabase SQL Editor.
2. **Announcements**
   - As admin: go to `/admin/announcements` → create a **global** announcement (path/session empty) and one scoped to a path/session (e.g. path `intro`, session `welcome`).
   - As student: open a session that has a scoped or global announcement → announcements appear above content, read-only.
3. **Questions**
   - As student: go to **My questions** → submit a question. Optionally open a session → **Ask a question** → submit (context pre-filled).
   - As admin: go to `/admin/questions` → open the question → add response, set status **Answered**, save.
   - As student: refresh **My questions** → your question shows the response.
4. **RLS**
   - As student: try to open another user’s question by ID in URL (e.g. `/admin/questions/<uuid>`) → you are redirected from admin to `/home`. Students have no way to list others’ questions; API would return only own rows.
   - As admin: announcements and questions CRUD works; students cannot create/update announcements or update questions.

---

## 5. Security summary

| Area | Who | What |
|------|-----|------|
| `live_announcements` | Anyone | Read (SELECT). |
| `live_announcements` | Admin only | Insert, update, delete. |
| `student_questions` | Student | Insert own row; select only own rows. |
| `student_questions` | Admin | Select all; update (respond, set status). |

All interaction is human-reviewed (admin writes announcements and responses). No public discussions, chat, or community features.

---

## 6. Files added in Phase 5

| Area | Files |
|------|--------|
| DB | `supabase/migrations/20250206300000_phase5_announcements_questions.sql` |
| Data | `lib/data/announcements.ts`, `lib/data/questions.ts` |
| Actions | `app/actions/admin-announcements.ts`, `app/actions/questions.ts` |
| Admin UI | `app/admin/announcements/page.tsx`, `app/admin/announcements/new/page.tsx`, `app/admin/announcements/[id]/edit/page.tsx`, `app/admin/questions/page.tsx`, `app/admin/questions/[id]/page.tsx` |
| App | `app/questions/page.tsx` (My questions); session page shows announcements + “Ask a question” link |
| Nav | `components/AppNav.tsx` – added “My questions” |
