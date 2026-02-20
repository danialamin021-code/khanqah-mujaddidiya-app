# Academic Batch System

Batch-based academic system for Khanqah Mujaddidiya App. Extends the existing module system with batches per module, daily sessions, attendance, and participation tracking.

## Data Model

### Tables

| Table | Purpose |
|-------|---------|
| `batches` | Batches per module; teacher, WhatsApp link, pricing |
| `batch_sessions` | Daily sessions per batch (title, date, zoom, topic) |
| `batch_enrollments` | User enrollment in batch; full_name, whatsapp, joined_whatsapp |
| `batch_attendance` | Per-session attendance (present/absent/late) |
| `batch_participation` | Aggregated: total_sessions, sessions_attended, attendance_percentage |
| `notifications` | In-platform notifications |
| `push_tokens` | Device tokens for mobile push (FCM) |

### Role Permissions

| Role | Batches | Sessions | Enrollments | Attendance | Participation |
|------|---------|----------|-------------|------------|---------------|
| Student | SELECT active | SELECT enrolled | Own CRUD (joined_whatsapp) | SELECT own | SELECT own |
| Teacher | SELECT assigned | Full (assigned) | SELECT/UPDATE assigned | INSERT/UPDATE | SELECT |
| Admin/Director | Full | Full | Full | Full | Full |

## Participation Recalculation

When attendance is marked or updated:

1. Upsert into `batch_attendance`
2. Call `recalculate_batch_participation(batch_id, user_id)` (SECURITY DEFINER)
3. Count total sessions in batch
4. Count present sessions for user
5. Calculate `attendance_percentage = (present / total) * 100`
6. Upsert into `batch_participation`

Runs server-side only; no client calculation.

## Notification Triggers

| Event | Recipients |
|-------|------------|
| New batch enrollment | Student (welcome), Teacher, Admin/Director |
| Attendance below 50% | Student |
| Batch completion | Student (future) |

## Student Experience

- Browse batches at `/batches`
- Enroll with full name, WhatsApp, country, city
- Success popup: "Enrollment successful. Welcome to [Batch Name]"
- WhatsApp group link displayed; "I have joined the WhatsApp group" button
- View attendance history, participation stats, sessions

## Teacher Dashboard

- **My Batches** (`/teacher/batches`): Students count, avg attendance, upcoming sessions
- **Batch detail** (`/teacher/batches/[id]`): Students list, attendance marking
- **Attendance** (`/teacher/attendance`): Module → Batch → Session → Mark

## Admin Dashboard

- **Academic Overview**: Total/active batches, avg attendance %, enrollments
- **Batch Management** (`/admin/batches`): Create, edit, archive; assign teacher; WhatsApp link; pricing
- **Participation Alerts**: Students below 50% attendance

## Director View

High-level cards on admin dashboard when role = director:

- Total students
- Active batches
- Overall attendance %
- Bayat count
- New enrollments (30d)

## Mobile Push (Scaffold)

- `push_tokens` table stores device tokens per user
- `lib/utils/push.ts`: `sendPushToUser()`, `registerPushToken()`
- When notification created: optionally call `sendPushToUser()` with FCM
- Requires `FIREBASE_SERVER_KEY` env var

## Indexes

- `batches`: module_id, teacher_id, is_active
- `batch_sessions`: batch_id
- `batch_enrollments`: user_id, batch_id, enrollment_status
- `batch_attendance`: batch_session_id, user_id
- `batch_participation`: batch_id, user_id
- `notifications`: user_id, created_at
- `push_tokens`: user_id

## Pagination

- Admin Users: 50/page
- Activity Logs: 25/page
- Batch enrollments: 50/page
- Batch sessions: 25/page
- Participation alerts: 25/page
