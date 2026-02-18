# System Hardening & Hybrid Real-Time Upgrade Plan

## Overview

This document outlines the upgrade sequence for RBAC hardening, permission enforcement, database normalization, and selective real-time implementation.

---

## PART 1 — RBAC HARDENING

### 1.1 Remove Legacy `role` Column
- **Migration:** Drop `role` column; use only `roles TEXT[]`
- **Code:** Remove all references to `profile.role`; select only `roles`
- **handle_new_user:** Insert `roles = ARRAY['student']` instead of `role = 'student'`

### 1.2 Strengthen Role Enforcement
- **New utilities:**
  - `requireRole(role)` — redirect if user lacks role
  - `requirePermission(permission)` — redirect if user lacks permission
  - `requireModuleAccess(moduleId)` — redirect if teacher lacks module assignment
- **Server-side:** All layout/route guards use these; no client-only checks

### 1.3 Protect Director Role
- **Rule:** Admin MUST NOT modify Director role
- **Check:** When updating profile roles: if target has `director` and current user is not director → deny
- **Server action:** `updateUserRoles(targetId, newRoles)` — validations inside

### 1.4 Normalize Module Assignment
- **New table:** `modules` (id UUID, slug TEXT, title TEXT, ...)
- **module_teachers:** Change `module_slug` → `module_id UUID` FK to modules
- **Queries:** All teacher-scoped queries use `module_id IN (assigned_module_ids)`

### 1.5 Strict Teacher Data Isolation
- **Policy:** ALL teacher queries filter by assigned modules
- **No global fetch:** Never fetch all sessions/attendance; always filter by module_id

---

## PART 2 — CLEAN PERMISSION MATRIX

| Permission | Student | Teacher | Admin | Director |
|------------|---------|---------|-------|----------|
| view_module | ✓ | (assigned) | ✓ | ✓ |
| manage_sessions | | (assigned) | ✓ | ✓ |
| manage_attendance | | (assigned) | ✓ | ✓ |
| manage_resources | | (assigned) | ✓ | ✓ |
| manage_announcements | | (assigned) | ✓ | ✓ |
| assign_teacher | | | ✓ | ✓ |
| manage_users | | | ✓ | ✓ |
| view_reports | | | ✓ | ✓ |
| assign_roles | | | | ✓ |

---

## PART 3 — HYBRID REAL-TIME

**Enable real-time ONLY for:**
- module_sessions (status, zoom_link)
- module_announcements (new, edit)
- module_attendance (updates affecting current student)

**DO NOT enable for:** reports, analytics, user management

**Hook:** `useRealtimeModule(moduleId, userId)` — subscribes to:
- sessions where module_id = moduleId
- announcements where module_id = moduleId
- attendance where user_id = userId (and session.module_id = moduleId)

**Scope:** Per-module only. Unsubscribe on unmount.

---

## PART 4 — LIVE SESSION STRUCTURE

**module_sessions table:**
- status ENUM ('scheduled', 'live', 'completed')
- updated_at timestamptz
- zoom_link, date, time, topic

---

## PART 5 — ATTENDANCE REAL-TIME

- Scope subscription by module_id
- Only affected students receive updates
- Teachers subscribe per module when viewing that module

---

## PART 6 — STRUCTURAL CLEANUP

- module_teachers: (user_id UUID, module_id UUID) UNIQUE
- FK constraints on all tables
- Indexes: attendance(module_id), sessions(module_id), announcements(module_id)

---

## PART 7 — SAFETY CHECKS

- [ ] Teachers cannot access other modules via URL
- [ ] Admin cannot escalate to Director
- [ ] Teacher cannot assign roles
- [ ] Enrollment remains auto-approved
- [ ] Real-time cannot leak cross-module data

---

## Implementation Sequence

1. Create migration (phases 7a, 7b)
2. Refactor permissions and auth guards
3. Update all auth/role references
4. Implement useRealtimeModule hook
5. Integrate real-time into Student module page and Progress
6. Verification

---

## New Utilities Created

| Utility | Location | Purpose |
|---------|----------|---------|
| `requireRole(roles)` | lib/auth.ts | Redirect if user lacks role |
| `requirePermission(permission)` | lib/auth.ts | Redirect if user lacks permission |
| `requireModuleAccess(moduleId)` | lib/auth.ts | Redirect if teacher lacks module |
| `requireModuleAccessBySlug(slug)` | lib/auth.ts | Resolve slug → id, then require access |
| `getAssignedModuleIds()` | lib/auth.ts | UUIDs of assigned modules |
| `getAssignedModuleSlugs()` | lib/auth.ts | Slugs for display/nav |
| `updateUserRoles(targetId, newRoles)` | app/actions/user-roles.ts | Update roles with Director protection |
| `useRealtimeModule(moduleId, userId)` | lib/hooks/use-realtime-module.ts | Selective real-time for one module |
| `canAccessModuleAsTeacher(roles, moduleId, assignedIds)` | lib/permissions.ts | Module-scoped access check |

---

## Verification Checklist

- [ ] Run `supabase/migrations/20250207000000_phase7_hardening.sql`
- [ ] Enable Realtime for module_sessions, module_announcements, module_attendance (Supabase Dashboard → Database → Replication)
- [ ] Teachers cannot access /teacher/[other-module-slug] via URL
- [ ] Admin cannot set director role on another user (DB trigger + server action)
- [ ] Teacher cannot assign roles
- [ ] Enrollment remains auto-approved
- [ ] Real-time subscription scoped to module_id only
- [ ] Dynamic navigation still works for student/teacher/admin/director
