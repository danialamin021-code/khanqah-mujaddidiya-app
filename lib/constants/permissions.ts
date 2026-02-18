/**
 * Role-Based Access Control — clean permission matrix.
 * Hierarchy: Director > Admin > Teacher > Student
 */

export type Role = "student" | "teacher" | "admin" | "director";

export type Permission =
  | "view_module"
  | "manage_sessions"
  | "manage_attendance"
  | "manage_resources"
  | "manage_announcements"
  | "assign_teacher"
  | "manage_users"
  | "view_reports"
  | "assign_roles";

/** Permissions granted per role. Teacher permissions are module-scoped (checked via requireModuleAccess). */
export const PERMISSION_BY_ROLE: Record<Role, Permission[]> = {
  student: ["view_module"],
  teacher: [
    "view_module",
    "manage_sessions",
    "manage_attendance",
    "manage_resources",
    "manage_announcements",
  ],
  admin: ["assign_teacher", "manage_users", "view_reports"],
  director: [
    "view_module",
    "manage_sessions",
    "manage_attendance",
    "manage_resources",
    "manage_announcements",
    "assign_teacher",
    "manage_users",
    "view_reports",
    "assign_roles",
  ],
};

/** Role hierarchy: higher index = higher authority */
export const ROLE_ORDER: Role[] = ["student", "teacher", "admin", "director"];

export function getHighestRole(roles: Role[]): Role | null {
  if (roles.length === 0) return null;
  const sorted = [...roles].sort(
    (a, b) => ROLE_ORDER.indexOf(b) - ROLE_ORDER.indexOf(a)
  );
  return sorted[0];
}
