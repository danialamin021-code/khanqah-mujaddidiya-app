# End-to-End Testing Checklist

Use this checklist to verify core flows before release or after major changes.

## Authentication & Roles

- [ ] **Sign up (Student)** – New user can sign up as Student; lands on Home
- [ ] **Sign up (Teacher)** – User requests Teacher role; sees Pending Approval page; can browse as Student
- [ ] **Sign up (Admin)** – User requests Admin role; sees Pending Approval page
- [ ] **Approval (Teacher)** – Admin/Director approves Teacher; user can access Teacher panel and features
- [ ] **Approval (Admin)** – Director approves Admin; user can access Admin panel
- [ ] **Role switcher** – User with multiple roles can switch roles; selection persists across navigation
- [ ] **Director bootstrap** – First Director can be assigned (via Admin UI or SQL when no directors exist)

## Student Flow

- [ ] **Browse modules** – View modules list
- [ ] **Enroll in module** – Enroll in a module; enrollment appears in My Progress
- [ ] **View module** – See module details, sessions, resources
- [ ] **My Progress** – Dashboard shows enrollment stats and attendance
- [ ] **Student questions** – Submit question; view in My Questions

## Teacher Flow

- [ ] **Teacher dashboard** – See assigned modules, sessions, stats
- [ ] **Create session** – Create session for assigned module
- [ ] **Mark attendance** – Mark attendance for enrolled students
- [ ] **Resources** – Add/manage resources for module
- [ ] **Announcements** – Create announcements for module

## Admin Flow

- [ ] **Admin dashboard** – Platform stats, attendance health, risk alerts, module performance
- [ ] **Users** – View Students/Teachers; edit roles; approve pending requests
- [ ] **Modules** – Create, edit, archive modules
- [ ] **Assignments** – Assign teachers to modules
- [ ] **Paths** – Create paths, add sessions
- [ ] **Reports** – View enrollment reports
- [ ] **System Health** – View system health metrics
- [ ] **Activity Logs** – View activity logs (Director/Admin only)
- [ ] **Approvals** – Approve/reject Teacher and Admin requests

## Soft Delete & Audit

- [ ] **Archive module** – Module is archived (soft delete); no hard delete
- [ ] **Activity logging** – Key actions (create/update module, assign teacher, etc.) appear in Activity Logs

## Navigation & UX

- [ ] **Bottom nav** – Correct items per role (Student, Teacher, Admin)
- [ ] **Admin nav dropdowns** – People, Content, Operations, System dropdowns work
- [ ] **Mobile** – Layout and navigation work on small screens

## Edge Cases

- [ ] **Last Director** – Cannot remove the last Director
- [ ] **Self-promotion** – User cannot promote themselves to Admin/Director
- [ ] **RLS** – Unauthorized users cannot access admin/director-only data
