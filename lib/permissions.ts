/**
 * Permission checks — derived from roles.
 * Teacher permissions are module-scoped; use requireModuleAccess for server-side.
 */

import type { Role, Permission } from "@/lib/constants/permissions";
import { PERMISSION_BY_ROLE } from "@/lib/constants/permissions";

/** Check if user has a global permission. Director has all. */
export function hasPermission(roles: Role[], permission: Permission): boolean {
  if (roles.length === 0) return false;
  if (roles.includes("director")) return true;
  for (const role of roles) {
    const perms = PERMISSION_BY_ROLE[role];
    if (perms?.includes(permission)) return true;
  }
  return false;
}

/** Teacher permissions (module-scoped) — caller must also validate module access. */
export function hasTeacherPermission(roles: Role[], permission: Permission): boolean {
  if (roles.includes("director") || roles.includes("admin")) return true;
  if (roles.includes("teacher")) {
    const perms = PERMISSION_BY_ROLE.teacher;
    return perms?.includes(permission) ?? false;
  }
  return false;
}

export function canAccessTeacherPanel(roles: Role[]): boolean {
  return roles.includes("teacher") || roles.includes("admin") || roles.includes("director");
}

export function canAccessAdminPanel(roles: Role[]): boolean {
  return roles.includes("admin") || roles.includes("director");
}

export function canAssignRoles(roles: Role[]): boolean {
  return roles.includes("director");
}

export function canAssignTeacherOrAdmin(roles: Role[]): boolean {
  return roles.includes("admin") || roles.includes("director");
}

/**
 * Check if user can access a specific module in teacher context.
 * Teacher: must be in assignedModuleIds.
 * Admin/Director: can access any module.
 */
export function canAccessModuleAsTeacher(
  roles: Role[],
  moduleId: string,
  assignedModuleIds: string[] = []
): boolean {
  if (roles.includes("director") || roles.includes("admin")) return true;
  if (roles.includes("teacher")) return assignedModuleIds.includes(moduleId);
  return false;
}
