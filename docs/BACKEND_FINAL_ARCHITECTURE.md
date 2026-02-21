# Backend Final Architecture

> **Status**: Centralized Edge Function backend. No Server Action fallbacks.
> **Date**: 2025-02

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (UI only)                           │
├─────────────────────────────────────────────────────────────────────────┤
│  Web (Next.js)                    │  Mobile (Expo)                       │
│  - Pure UI components             │  - Pure UI components               │
│  - Server Actions = thin wrappers │  - supabase.functions.invoke()      │
│  - Only: auth check, invoke,       │  - Same Edge Functions              │
│    revalidatePath                 │                                      │
└──────────────┬────────────────────┴────────────────┬─────────────────────┘
              │ Bearer token                         │ Bearer token
              ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SUPABASE EDGE FUNCTIONS (All Business Logic)         │
├─────────────────────────────────────────────────────────────────────────┤
│  enrollment-engine   │ enroll, mark_whatsapp_joined                      │
│  attendance-engine   │ mark, bulk_mark                                   │
│  role-engine         │ approveRole, rejectRole, assignTeacher,           │
│                      │ unassignTeacher, updateUserRoles                  │
│  academic-engine     │ createBatch, updateBatch, createBatchSession       │
│  notification-engine │ create, createRoleRequest, markRead, bulkMarkRead│
│  bayat-engine        │ submit                                            │
└──────────────┬──────────────────────────────────────────────────────────┘
              │ Service role key (internal only)
              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL + Auth)                         │
├─────────────────────────────────────────────────────────────────────────┤
│  RLS enforced on all tables                                              │
│  No direct client writes to core tables                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Security Checklist

| Item | Status |
|------|--------|
| No service key in client bundle | ✅ |
| All Edge Functions use service role internally | ✅ |
| RLS still active on all tables | ✅ |
| No public insert/update on critical tables | ✅ |
| No console logs exposing sensitive data | ✅ |
| No secrets in env exposed to frontend | ✅ |
| EDGE_INTERNAL_SECRET for server→notification-engine | ✅ |
| Bearer token validation in all engines | ✅ |

---

## Environment Variables

### Next.js (.env.local)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon key (public)
- `SUPABASE_SERVICE_ROLE_KEY` — Server only, never exposed
- `EDGE_INTERNAL_SECRET` — For notifyRoleRequest → notification-engine

### Supabase Edge Functions (Dashboard secrets)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` — Auto-injected
- `EDGE_INTERNAL_SECRET` — Must be set for createRoleRequest
- `BAYAT_WEBHOOK_URL` / `REQUEST_WEBHOOK_URL` — Optional webhook

---

## Deployment

```bash
supabase functions deploy enrollment-engine
supabase functions deploy attendance-engine
supabase functions deploy role-engine
supabase functions deploy academic-engine
supabase functions deploy notification-engine
supabase functions deploy bayat-engine
```

Set `EDGE_INTERNAL_SECRET` in Supabase Dashboard → Edge Functions → Secrets.

---

## No Fallbacks

Web fails clearly if Edge Function unavailable. No Server Action business logic remains.
