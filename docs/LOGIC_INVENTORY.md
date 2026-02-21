# Logic Inventory — Business Logic Mapping

> **Purpose**: Internal mapping of all business logic for migration to Supabase Edge Functions.
> **Phase**: 2 — Inventory only. No logic changes.

---

## Summary

| Category | Count | Location |
|----------|-------|----------|
| Server Actions (app/actions) | 18 files | Next.js Server Actions |
| Server Actions (lib/actions) | 9 files | Next.js Server Actions |
| Utils (lib/utils) | 4 functions | Shared helpers |
| DB RPCs | 2 | `recalculate_batch_participation`, `recalculate_batch_participation_all` |

---

## app/actions/

### admin-announcements.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `createAnnouncement` | live_announcements, learning_paths, sessions | Yes | No | No | Admin only |
| `updateAnnouncement` | live_announcements | Yes | No | No | Admin only |
| `deleteAnnouncement` | live_announcements | Yes | No | No | Admin only |

### admin-requests.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `updateBayatRequestStatus` | bayat_requests | Yes | No | No | Admin |
| `updateGuidanceRequestStatus` | guidance_requests | Yes | No | No | Admin |

### bayat-requests.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `submitBayatRequest` | bayat_requests | Yes | Yes (directors) | No | Authenticated user |
| — | — | — | Webhook: notifyRequestWebhook | — | — |

### role-approvals.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `approveRoleRequest` | profiles | Yes | No | No | Admin/Director (Director for admin) |
| `rejectRoleRequest` | profiles | Yes | No | No | Admin/Director |

### batch-management.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `createBatch` | batches | Yes | No | No | Admin/Director |
| `updateBatch` | batches | Yes | No | No | Admin/Director |
| `createBatchSession` | batch_sessions | Yes | No | No | Teacher of batch or Admin/Director |
| — | — | — | RPC: recalculate_batch_participation_all | — | — |

### guidance-requests.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `submitGuidanceRequest` | guidance_requests | Yes | No (webhook only) | No | Authenticated user |
| — | — | — | Webhook: notifyRequestWebhook | — | — |

### notifications.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `getNotifications` | notifications (read) | Yes | — | No | Own user |
| `getUnreadCount` | notifications (read) | Yes | — | No | Own user |
| `markNotificationRead` | notifications | Yes | No | No | Own user |
| `markAllNotificationsRead` | notifications | Yes | No | No | Own user |
| `notifyRoleRequest` | notifications (via createNotification) | Yes | Yes | No | Internal (signup flow) |

### module-enrollment.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `enrollInModule` | module_enrollments, modules | Yes | No (webhook) | No | Authenticated user |
| — | — | — | Webhook: notifyEnrollmentWebhook | — | — |

### questions.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `submitQuestion` | student_questions | Yes | No | No | Authenticated user |
| `respondToQuestion` | student_questions | Yes | No | No | Admin |

### user-roles.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `updateUserRoles` | profiles | Yes | No | No | Admin/Director (Director for admin/director) |

### enrollment.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `enrollInPath` | enrollments | Yes | No | No | Authenticated user |

### progress.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `markSessionComplete` | session_completions | Yes | No | No | Authenticated user |
| `updateLastVisited` | enrollments | Yes | No | No | Authenticated user |

### admin-announcements.ts (live_announcements)
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| create/update/delete | live_announcements | Yes | No | No | Admin |

### admin-paths.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `createPath` | learning_paths, levels | Yes | No | No | Admin |
| `updatePath` | learning_paths | Yes | No | No | Admin |
| `deletePath` | learning_paths | Yes | No | No | Admin |
| `createSession` | sessions | Yes | No | No | Admin |
| `updateSession` | sessions | Yes | No | No | Admin |
| `deleteSession` | sessions | Yes | No | No | Admin |

### admin-sessions.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `createSession` | sessions | Yes | No | No | Admin |
| `updateSession` | sessions | Yes | No | No | Admin |
| `deleteSession` | sessions | Yes | No | No | Admin |

### notification-preferences.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `updateNotificationPreferences` | profiles | Yes | No | No | Own user |

### platform-events.ts, platform-news.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| CRUD | platform_events, platform_news | Yes | No | No | Admin |

---

## lib/actions/

### batch-enrollment.ts ⭐ PRIORITY (Enrollment Engine)
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `enrollInBatch` | batch_enrollments, batches, profiles | Yes | Yes (student, teacher, admin) | No | Authenticated user |
| `markJoinedWhatsApp` | batch_enrollments | Yes | No | No | Authenticated user |

**Details**: Rate limit, duplicate check (23505), activity log, createNotification for student + teachers + admins. Uses service client for admin lookup.

### batch-attendance.ts ⭐ PRIORITY (Attendance Engine)
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `markBatchAttendance` | batch_attendance, batch_sessions, batches, batch_participation | Yes | Yes (attendance_below_threshold) | No | Teacher of batch or Admin/Director |
| `bulkMarkPresent` | (calls markBatchAttendance) | Yes | Yes | No | Teacher of batch only |

**Details**: RPC `recalculate_batch_participation`, upsert attendance, notification if < 50%.

### module-teachers.ts ⭐ PRIORITY (Role Engine)
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `assignTeacher` | module_teachers, modules | Yes | Yes (module_assignment) | No | Admin |
| `unassignTeacher` | module_teachers | Yes | No | No | Admin |

### module-sessions.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `createModuleSession` | module_sessions, modules | Yes | No | No | Admin or assigned teacher |
| `updateModuleSession` | module_sessions | Yes | No | No | Admin or assigned teacher |
| `deleteModuleSession` | module_sessions (soft delete) | Yes | No | No | Admin or assigned teacher |

### module-announcements.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `createModuleAnnouncement` | module_announcements | Yes | No | No | Admin or assigned teacher |
| `updateModuleAnnouncement` | module_announcements | Yes | No | No | Admin or assigned teacher |
| `deleteModuleAnnouncement` | module_announcements | Yes | No | No | Admin or assigned teacher |

### module-attendance.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `markAttendance` | module_attendance, module_sessions | Yes | No | No | Admin or assigned teacher |

### modules.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `createModule`, `updateModule`, etc. | modules | Yes | No | No | Admin |

---

## lib/utils/

### notifications.ts ⭐ PRIORITY (Notification Engine)
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `createNotification` | notifications | Bypass (service client) | — | No | Internal only |
| `createNotificationsForUsers` | notifications | Bypass | — | No | Internal only |

**Called by**: batch-enrollment, bayat-requests, module-teachers, batch-attendance, notifications (notifyRoleRequest).

### activity-logger.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `logActivity` | system_activity_logs | Yes | No | No | Uses user context |

### push.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `sendPushToUser` | push_tokens (read) | Service client | — | No | Internal |
| `registerPushToken` | push_tokens | Service client | No | No | User ID passed |
| `deletePushTokensForUser` | push_tokens | Service client | No | No | User ID passed |

### rate-limit.ts
| Function | Tables Touched | RLS Dep | Notifications | Realtime | Role Validation |
|----------|----------------|---------|---------------|----------|-----------------|
| `checkRateLimit` | In-memory (no DB) | No | No | No | N/A |

---

## Database RPCs (Postgres)

| RPC | Purpose | Called From |
|-----|---------|-------------|
| `recalculate_batch_participation(p_batch_id, p_user_id)` | Recompute attendance % and completion_status | batch-attendance |
| `recalculate_batch_participation_all(p_batch_id)` | Recompute for all users in batch | batch-management (createBatchSession) |

---

## Migration Priority Order

1. **enrollment-engine**: batch-enrollment.ts (enrollInBatch, markJoinedWhatsApp)
2. **attendance-engine**: batch-attendance.ts (markBatchAttendance, bulkMarkPresent)
3. **role-engine**: role-approvals.ts, module-teachers.ts, user-roles.ts, bayat-requests.ts
4. **notification-engine**: lib/utils/notifications.ts (createNotification)
5. **academic-engine**: batch status, completion (via RPC), batch-management (createBatchSession)

---

## Tables Requiring RLS Audit (Phase 9)

- batch_enrollments
- batches
- batch_attendance
- batch_participation
- batch_sessions
- notifications
- push_tokens
- bayat_requests
- guidance_requests
- profiles (roles)
- module_teachers
- system_activity_logs

---

*Generated for Edge Function migration. Do not change logic in this phase.*
