# Role & Permission System — Implementation Plan

## System Vision

**Hierarchy:** Director (Sheikh) > Admin > Teacher > Student

**Rules:**
- Director has highest authority; can act as Admin and Teacher
- Admin can also be Teacher
- NOT all Teachers are Admin
- Teachers CANNOT approve enrollments
- Student enrollment is AUTO-APPROVED
- Teachers only see assigned modules
- Each module operates independently
- Teachers only see students of assigned modules

---

## Phase 1 — Role & Permission Structure

### 1.1 Role Model
- **Multiple roles per user:** `roles: string[]` (e.g. `["student"]`, `["teacher","admin"]`, `["teacher","admin","director"]`)
- **Migration:** Add `roles` column to `profiles`; backfill from existing `role`
- **Role types:** `student` | `teacher` | `admin` | `director`

### 1.2 Permission Matrix
| Permission | Student | Teacher | Admin | Director |
|------------|---------|---------|-------|----------|
| View enrolled modules | ✓ | (own) | ✓ | ✓ |
| View progress | ✓ | (own) | ✓ | ✓ |
| View resources | ✓ | (own) | ✓ | ✓ |
| Join live session | ✓ | (own) | ✓ | ✓ |
| Create/Edit/Delete sessions | | ✓ (assigned) | ✓ | ✓ |
| Mark attendance | | ✓ (assigned) | ✓ | ✓ |
| View enrolled students | | ✓ (assigned) | ✓ | ✓ |
| Upload resources | | ✓ (assigned) | ✓ | ✓ |
| Post announcements | | ✓ (assigned) | ✓ | ✓ |
| Assign teachers to modules | | | ✓ | ✓ |
| Manage users | | | ✓ | ✓ |
| View all modules | | | ✓ | ✓ |
| View reports | | | ✓ | ✓ |
| Assign admin/teacher roles | | | | ✓ |
| Full system access | | | | ✓ |

### 1.3 Implementation
- `lib/auth.ts` — extend `getCurrentRole` → `getUserRoles()` returning `Role[]`
- `lib/permissions.ts` — `hasPermission(roles, permission)` and `canAccessModule(roles, moduleSlug, assignedModules?)`
- `lib/constants/permissions.ts` — permission definitions and role-permission map

---

## Phase 2 — Navigation Structure

### 2.1 Dynamic Menu by Role
- **Student:** Home, My Modules, Progress, Bayat
- **Teacher:** Dashboard, My Modules (Teacher), Sessions, Students, Attendance, Resources, Announcements
- **Admin:** All Teacher features (if teacher) + User Management, Module Management, Teacher Assignment, Reports
- **Director:** All Admin features (full access)

### 2.2 Implementation
- `components/RoleNav.tsx` or extend `HamburgerMenu` + `AppNav` with role-aware items
- Server component fetches roles; pass to client for nav rendering
- Reuse existing layout; no duplicate layouts

---

## Phase 3 — Teacher Module Structure

### 3.1 Teacher Panel Route
- Base: `/teacher` (or `/panel/teacher`)
- Sub-routes per module: `/teacher/[moduleSlug]` with sub-nav:
  - Overview
  - Sessions
  - Students
  - Attendance
  - Resources
  - Announcements

### 3.2 Data Isolation
- Teacher sees only assigned modules
- Each module page filters by `module_slug` and `teacher_id`

---

## Phase 4 — Data Relation Structure

### 4.1 New/Extended Tables (Migration)
- `profiles.roles` — `text[]` default `['student']`
- `module_teachers` — `user_id`, `module_slug` (teacher assignments)
- `module_enrollments` — `user_id`, `module_slug` (auto-approved; maps to learning modules)
- `module_sessions` — `id`, `module_slug`, `date`, `time`, `zoom_link`, `topic`
- `module_attendance` — `session_id`, `user_id`, `status`
- `module_resources` — `module_slug`, `title`, `type`, `url`
- `module_announcements` — `module_slug`, `title`, `content`

### 4.2 Current State
- Use mock/static data if backend not wired
- Types and structure first

---

## Phase 5 — Admin Features

### 5.1 Admin Panel
- User Management: view users, change roles, assign teacher/admin
- Module Management: create module, assign teacher, edit
- Basic Reports: total students, teachers, modules, sessions

### 5.2 Constraints
- Admin CANNOT approve enrollment (auto-approved)
- Admin CANNOT override Director

---

## Phase 6 — Director Authority

- Full access via permission checks
- Can assign Admin and Teacher roles
- No separate panel; expanded permissions in admin

---

## File Structure (New/Modified)

```
lib/
  auth.ts              # getUserRoles, requireRole
  permissions.ts       # hasPermission, canAccessModule
  constants/
    permissions.ts     # PERMISSION_MATRIX, ROLES
app/
  teacher/
    layout.tsx         # Teacher layout, role check
    page.tsx           # Teacher dashboard
    [moduleSlug]/
      layout.tsx       # Module sub-nav
      page.tsx         # Overview
      sessions/
      students/
      attendance/
      resources/
      announcements/
  admin/
    layout.tsx         # Admin layout (teacher + admin + director)
    users/
    modules/
    reports/
components/
  RoleNav.tsx          # Role-aware nav items
  TeacherModuleNav.tsx # Module sub-navigation
```

---

## Migration Order

1. Run `supabase/migrations/20250206400000_phase6_rbac_roles.sql` in Supabase SQL Editor
2. Add `roles text[]` to profiles; backfill from `role`
3. Create `module_teachers` table
4. Extend `is_admin` to support director
5. RLS policies for module_teachers (admins/directors can assign)

## Enabling Teacher/Admin/Director

After migration, promote users via SQL:

```sql
-- Promote to admin
UPDATE public.profiles SET role = 'admin', roles = ARRAY['admin'] WHERE id = 'user-uuid';

-- Promote to teacher
UPDATE public.profiles SET role = 'teacher', roles = ARRAY['teacher'] WHERE id = 'user-uuid';

-- Promote to director
UPDATE public.profiles SET role = 'director', roles = ARRAY['director'] WHERE id = 'user-uuid';

-- Assign teacher to module
INSERT INTO public.module_teachers (user_id, module_slug) VALUES ('user-uuid', 'tafseer');
```
