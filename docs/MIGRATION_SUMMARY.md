# Edge Function Migration Summary

> **Status**: Phases 1–5 complete. Phases 6–12 scaffolded.
> **Date**: 2025-02

---

## Migration Summary

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Done | Structural separation: /mobile in .gitignore, web builds cleanly |
| 2 | ✅ Done | Logic inventory: docs/LOGIC_INVENTORY.md |
| 3 | ✅ Done | Edge Function infrastructure: 5 engines created |
| 4 | ✅ Done | Enrollment Engine: full logic, web invokes with fallback |
| 5 | ✅ Done | Attendance Engine: full logic, web invokes with fallback |
| 6 | 🔲 Scaffold | Academic Engine: placeholder (batch status, completion) |
| 7 | 🔲 Scaffold | Role Engine: placeholder (approvals, teacher assign, bayat) |
| 8 | 🔲 Scaffold | Notification Engine: create action works, push TBD |
| 9 | 🔲 Pending | RLS audit |
| 10 | 🔲 Pending | Analytics stability |
| 11 | 🔲 Pending | Mobile client readiness |
| 12 | 🔲 Pending | Stability tests |

---

## Updated Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  Web (Next.js)              │  Mobile (Expo) [separate project]          │
│  - EnrollModal              │  - Will use supabase.functions.invoke()    │
│  - Teacher attendance UI    │  - Same Edge Functions as web               │
└──────────────┬──────────────┴────────────────┬──────────────────────────┘
               │                                │
               │  Bearer token                  │  Bearer token
               ▼                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SUPABASE EDGE FUNCTIONS                               │
├─────────────────────────────────────────────────────────────────────────┤
│  enrollment-engine    │  enroll, mark_whatsapp_joined                   │
│  attendance-engine    │  mark, bulk_mark                                 │
│  role-engine          │  [Phase 7] approve_role, assign_teacher, bayat   │
│  notification-engine  │  create (internal)                              │
│  academic-engine      │  [Phase 6] batch_status, completion              │
└──────────────┬──────────────────────────────────────────────────────────┘
               │  Service role key (internal only)
               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL + Auth)                          │
├─────────────────────────────────────────────────────────────────────────┤
│  Tables: batch_enrollments, batch_attendance, batch_participation,        │
│          notifications, profiles, batches, batch_sessions, ...           │
│  RPCs: recalculate_batch_participation, recalculate_batch_participation_all│
│  RLS: Enforced on all tables                                              │
└─────────────────────────────────────────────────────────────────────────┘

FALLBACK: Next.js Server Actions remain; web tries Edge Function first.
```

---

## Security Checklist

| Item | Status |
|------|--------|
| Service key never in frontend | ✅ Only in Edge Functions (Deno env) |
| No direct DB writes from client | ✅ All mutations via Server Actions or Edge Functions |
| RLS on all tables | ✅ Existing RLS preserved |
| Bearer token validation | ✅ Edge Functions validate via getUserFromRequest |
| Role validation in engines | ✅ enrollment: auth only; attendance: teacher/admin |
| CORS configured | ✅ Allowed for Supabase project origin |
| No tables deleted | ✅ |
| No columns dropped | ✅ |

---

## Rollback Plan

1. **Disable Edge Function invocation**: Set `NEXT_PUBLIC_SUPABASE_URL` to empty or remove the invoke logic in `lib/utils/invoke-edge-function.ts` — server actions will always run (they already fallback when invoke returns null).

2. **Revert batch-enrollment.ts**: Remove the `invokeEnrollmentEngine` block; keep only the original server action logic.

3. **Revert batch-attendance.ts**: Remove the `invokeAttendanceEngine` block; keep only the original server action logic.

4. **Edge Functions**: Can be left deployed; they are only called when the web explicitly invokes them. If not deployed, invoke returns null and fallback runs.

5. **Git**: `git revert` the migration commits if needed.

---

## Deployment Steps

1. **Deploy Edge Functions** (Supabase CLI):
   ```bash
   supabase functions deploy enrollment-engine
   supabase functions deploy attendance-engine
   ```

2. **Verify**: Web app will try Edge Function first. If functions are not deployed, fallback to server action works.

3. **Mobile**: When /mobile is restored, call `supabase.functions.invoke("enrollment-engine", { body: { action: "enroll", ... } })` with the user's session.

---

## Files Changed

- `.gitignore` — added /mobile
- `tsconfig.json` — exclude supabase/functions
- `docs/LOGIC_INVENTORY.md` — new
- `docs/MIGRATION_SUMMARY.md` — new
- `supabase/functions/_shared/*` — cors, supabase, auth
- `supabase/functions/enrollment-engine/index.ts` — full logic
- `supabase/functions/attendance-engine/index.ts` — full logic
- `supabase/functions/role-engine/index.ts` — placeholder
- `supabase/functions/notification-engine/index.ts` — create action
- `supabase/functions/academic-engine/index.ts` — placeholder
- `lib/utils/invoke-edge-function.ts` — new
- `lib/actions/batch-enrollment.ts` — Edge Function + fallback
- `lib/actions/batch-attendance.ts` — Edge Function + fallback
