# Production System Audit — Khanqah Mujaddidiya App

**Date:** 2025-02-17  
**Scope:** Security hardening, RBAC, RLS, error handling, logging, performance

---

## 1. RBAC Summary

### Roles
| Role | Access |
|------|--------|
| **Student** | `/home`, `/modules`, `/profile`, `/settings`, `/paths`, `/news`, `/events`, `/dashboard` |
| **Teacher** | Student routes + `/teacher`, `/teacher/[moduleSlug]/*` (assigned modules only) |
| **Admin** | Teacher routes + `/admin`, `/admin/*` |
| **Director** | All Admin access; only Director can assign/remove Director role |

### Protections Implemented
- **Middleware** (`lib/supabase/middleware.ts`): Blocks students from `/teacher` and `/admin`; blocks teachers from `/admin`. Redirects to `/unauthorized`.
- **Layouts**: `app/admin/layout.tsx` and `app/teacher/layout.tsx` call `requireAdmin()` / `requireTeacher()`; redirect to `/unauthorized` if denied.
- **Teacher module access**: `app/teacher/[moduleSlug]/layout.tsx` calls `requireModuleAccessBySlug()` — teachers can only access assigned modules.
- **Server actions**: All admin/teacher actions validate `requireAdmin()`, `requireTeacher()`, or `requireModuleAccess()` before mutating data.

---

## 2. RLS Summary

### Public Read (anyone)
- `modules`, `platform_news`, `platform_events`
- `learning_paths`, `levels`, `sessions`, `live_announcements`
- `module_sessions`, `module_announcements`, `module_resources`

### Restricted
| Table | Students | Teachers | Admin/Director |
|-------|----------|----------|----------------|
| `profiles` | Own only | Own only | Read all |
| `module_enrollments` | Own only | Assigned modules | All |
| `module_attendance` | Own only | Assigned modules | All |
| `student_questions` | Own only | — | All |
| `bayat_requests` | Own only | — | All |
| `guidance_requests` | Own only | — | All |
| `system_activity_logs` | — | — | All |

### Hardening (Migration `20250217000000_production_hardening_rls.sql`)
- **module_attendance**: Replaced broad "authenticated read all" with student-own, teacher-assigned, admin-all policies.
- **profiles**: Added `protect_profile_roles_on_update` trigger to block non-admin changes to `roles` and `role_request`.

---

## 3. Route Protection Summary

| Route | Middleware | Layout |
|-------|------------|--------|
| `/teacher`, `/teacher/*` | Role check → redirect if not teacher/admin/director | `requireTeacher()` |
| `/admin`, `/admin/*` | Role check → redirect if not admin/director | `requireAdmin()` |
| `/teacher/[moduleSlug]/*` | — | `requireModuleAccessBySlug()` |
| `/unauthorized` | — | Public (403 page) |
| `/not-found` | — | 404 page |

---

## 4. Director Protection Logic

- **Trigger** `protect_director_role`: Only a Director can add or modify the Director role.
- **Bootstrap**: When no directors exist (`director_count = 0`), first Director assignment is allowed.
- **Last Director**: `updateUserRoles` server action blocks removal of the last Director.
- **Self-promotion**: Users cannot change their own roles.

---

## 5. Logging Architecture

### Activity Logs (`system_activity_logs`)
- **Fields**: `actor_id`, `actor_role`, `action_type`, `entity_type`, `entity_id`, `description`, `metadata`, `created_at`
- **Logged actions**: Role updates, role approvals/rejections, module teacher assignment, enrollment, attendance, session create/edit, module create/edit/archive
- **Failed authorization**: `failed_authorization` when user attempts unauthorized action (e.g. reject role request without permission)
- **Access**: Admin/Director only via `/admin/activity-logs`

---

## 6. Error Handling

- **Global error boundary** (`app/error.tsx`): Catches errors; no stack trace in production; Sentry capture.
- **Global error** (`app/global-error.tsx`): Same for root layout.
- **404** (`app/not-found.tsx`): Custom not-found page.
- **403** (`app/unauthorized/page.tsx`): Access denied page.
- **Console**: `console.error` only in development.

---

## 7. Role Switcher Hardening

- **Storage**: Active role stored in **httpOnly** cookie (set via `setActiveRoleAction`).
- **Validation**: Server action validates user has the requested role before setting cookie.
- **Initial value**: Passed from server (`getActiveRoleForServer`) to `ActiveRoleProvider`; no client-side role tampering.

---

## 8. Remaining Risks (Addressed)

| Risk | Mitigation |
|------|-------------|
| **Rate limiting** | Implemented: enrollment (10/min), bayat (3/hr), guidance (5/hr) per user. See `lib/utils/rate-limit.ts`. |
| **Webhook validation** | HMAC-SHA256 signature in `X-Webhook-Signature` when `WEBHOOK_SECRET` is set. |
| **Pagination** | Implemented: Admin Users (50/page), Activity Logs (25/page), Teacher Students (50/page). |
| **CORS** | Next.js defaults; verify for API routes if added. |

---

## 9. Files Modified (Hardening)

- `lib/supabase/middleware.ts` — RBAC route checks
- `app/admin/layout.tsx`, `app/teacher/layout.tsx` — Redirect to `/unauthorized`
- `app/not-found.tsx` — New 404 page
- `app/unauthorized/page.tsx` — New 403 page
- `app/error.tsx`, `app/global-error.tsx` — No console in production
- `app/actions/active-role.ts` — httpOnly cookie for role
- `app/actions/role-approvals.ts` — Activity logging for reject + failed auth
- `components/ActiveRoleProvider.tsx` — New; replaces `use-active-role.ts`
- `app/layout.tsx` — Wraps with `ActiveRoleProvider`, passes `initialRole`
- `supabase/migrations/20250217000000_production_hardening_rls.sql` — RLS + indexes
