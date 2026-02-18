# Phase-4 Setup – Admin Roles & Content Management

Phase-4 adds **user roles** (student / admin), a **protected admin dashboard**, and **RLS** so only admins can create or edit learning paths and sessions. Students remain read-only on content.

---

## 1. Run the Phase-4 migration

1. Open **Supabase Dashboard** → your project → **SQL Editor** → **New query**.
2. Paste the full contents of **`supabase/migrations/20250206200000_phase4_admin_roles.sql`**.
3. Click **Run**.

This will:

- Create **`profiles`** (id = auth user id, role = 'student' | 'admin').
- Create **`is_admin()`** (returns true if current user’s profile has role = 'admin').
- Add RLS so **only admins** can INSERT/UPDATE/DELETE on `learning_paths`, `levels`, and `sessions`. SELECT stays allowed for everyone.
- Trigger **`on_auth_user_created`**: new signups get a row in `profiles` with role = 'student'.
- **Backfill** existing auth users with a student profile.

---

## 2. Promote a user to admin

After the migration, give at least one user the admin role:

1. In Supabase go to **Authentication** → **Users** and copy the **User UID** of the account you want as admin.
2. In **SQL Editor** run (replace the UUID):

```sql
update public.profiles set role = 'admin' where id = 'paste-your-user-uid-here';
```

Or, if you are logged into the app in the same browser and Supabase supports `auth.uid()` in the SQL Editor context:

```sql
update public.profiles set role = 'admin' where id = auth.uid();
```

---

## 3. Admin dashboard

- **URL:** `/admin` (only accessible when logged in as admin).
- **Protection:** `app/admin/layout.tsx` calls `requireAdmin()`; if the user is not admin, they are redirected to `/home`.
- **Pages:**
  - **`/admin`** – Dashboard with link to paths.
  - **`/admin/paths`** – List paths; links to “New path”, “Sessions”, “Edit”.
  - **`/admin/paths/new`** – Create path (slug, title, description, introduction, sort order). A default “Beginner” level is created.
  - **`/admin/paths/[slug]/edit`** – Edit path (slug is read-only).
  - **`/admin/paths/[slug]/sessions`** – List sessions for that path; link to “New session”.
  - **`/admin/paths/[slug]/sessions/new`** – Create session (uses first level of the path).
  - **`/admin/paths/[slug]/sessions/[sessionSlug]/edit`** – Edit session (title, type, description, body, sort order).

Students and guests who open `/admin` are redirected to `/home`. All create/update operations use the same Supabase client as the rest of the app; **RLS** blocks non-admin writes.

---

## 4. Local testing

1. Run the Phase-4 migration and promote one user to admin (step 2).
2. Log in as that user and go to **http://localhost:3000/admin**.
3. You should see the admin dashboard. Non-admin users should be redirected to `/home`.
4. **Paths:** Create a new path → it appears in the list and on the app’s Paths page. Edit it from `/admin/paths/[slug]/edit`.
5. **Sessions:** Open “Sessions” for a path → create a new session → it appears in the app under that path. Edit session body and confirm the change on the session page.
6. **RLS:** Log in as a **student** (or use an incognito window with a student account). Try opening `/admin` → redirect to home. Student can still read paths/sessions in the app but cannot call admin create/update (those run as the student user and will be denied by RLS).

---

## 5. Security summary

| Area | Who | What |
|------|-----|------|
| `profiles` | User | Read own row only. Insert own as 'student'. |
| `profiles` | Admin | Update any profile (e.g. promote to admin). |
| `learning_paths`, `levels`, `sessions` | Anyone | Read (SELECT). |
| `learning_paths`, `levels`, `sessions` | Admin only | Insert, update, delete. |
| `enrollments`, `session_completions` | (Phase-2) | Unchanged; users manage own rows. |

Admin checks in the app use **`requireAdmin()`**, which reads the current user’s `profiles.role`. RLS enforces the same in the database.

---

## 6. Files added in Phase 4

| Area | Files |
|------|--------|
| DB | `supabase/migrations/20250206200000_phase4_admin_roles.sql` |
| Auth | `lib/auth.ts` (getCurrentRole, requireAdmin) |
| Actions | `app/actions/admin-paths.ts`, `app/actions/admin-sessions.ts` |
| Admin UI | `app/admin/layout.tsx`, `app/admin/page.tsx`, `app/admin/paths/page.tsx`, `app/admin/paths/new/page.tsx`, `app/admin/paths/[slug]/edit/page.tsx`, `app/admin/paths/[slug]/sessions/page.tsx`, `app/admin/paths/[slug]/sessions/new/page.tsx`, `app/admin/paths/[slug]/sessions/[sessionSlug]/edit/page.tsx` |

No link to `/admin` is shown in the main app nav; admins go directly to **/admin**.
