# Supabase Migrations

## Option A: Combined SQL (no CLI)

1. Run `npm run db:apply` to generate `scripts/apply-migrations.sql`
2. Open [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard/project/_/sql)
3. Paste the contents of `scripts/apply-migrations.sql` and run

## Option B: Supabase CLI

```bash
supabase db push
```

## Migration order (oldest → newest)

| Timestamp | File | Description |
|-----------|------|-------------|
| 20250206 | phase2_enrollments | Enrollments table |
| 20250206 | phase3_paths_sessions | Paths and sessions |
| 20250206 | phase4_admin_roles | Profiles, admin roles |
| 20250206 | phase5_announcements_questions | Announcements, questions |
| 20250206 | phase6_rbac_roles | RBAC, module_teachers |
| 20250207 | phase7_hardening | Modules table, module_sessions, etc. |
| 20250207 | phase8_initial_role_policy | Role policies |
| 20250207 | phase9_role_request_approval | Role request flow |
| 20250207 | phase10_admin_read_profiles | Admin read profiles |
| 20250209 | phase11_module_enrollments | Module enrollments |
| 20250210 | phase12_audit_and_soft_delete | Soft delete, audit |
| 20250211 | manual_approve_director | Director approval |
| 20250211 | bootstrap_first_director | First director bootstrap |
| 20250212 | realtime_profiles | Realtime for profiles |
| 20250213 | module_enrollment_metadata | Enrollment metadata |
| 20250214 | bayat_guidance_requests | Bayat, guidance requests |
| 20250215 | platform_news_events | platform_news, platform_events |
| 20250216 | notification_preferences | notify_announcements, notify_events |
| 20250217 | production_hardening_rls | RLS fixes, profile protection, indexes |

## Manual check

After applying, verify in Supabase:

- `profiles` has `notify_announcements`, `notify_events`
- `platform_news` and `platform_events` tables exist
