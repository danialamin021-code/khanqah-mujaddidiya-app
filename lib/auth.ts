/**
 * Server-side role and permission checks.
 * Single source of truth: roles[] only. No legacy role column.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Role, Permission } from "@/lib/constants/permissions";
import {
  canAccessAdminPanel,
  canAccessTeacherPanel,
  hasPermission,
  canAccessModuleAsTeacher,
} from "@/lib/permissions";

export type { Role, Permission } from "@/lib/constants/permissions";

const VALID_ROLES: Role[] = ["student", "teacher", "admin", "director"];

export async function getUserRoles(): Promise<Role[]> {
  const supabase = await createClient();
  if (!supabase) return ["student"];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  if (error || !profile) return ["student"];

  const rolesRaw = (profile as { roles?: string[] }).roles;
  if (!Array.isArray(rolesRaw) || rolesRaw.length === 0) return ["student"];

  return rolesRaw.filter((r): r is Role => VALID_ROLES.includes(r as Role));
}

/** Module IDs (UUIDs) assigned to current user. Empty if not teacher. */
export async function getAssignedModuleIds(): Promise<string[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("module_teachers")
    .select("module_id")
    .eq("user_id", user.id);
  if (error) return [];
  return (data ?? []).map((r) => r.module_id);
}

/** For backward compat: slugs from assigned modules. Uses modules table. */
export async function getAssignedModuleSlugs(): Promise<string[]> {
  const ids = await getAssignedModuleIds();
  if (ids.length === 0) return [];

  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("modules")
    .select("slug")
    .in("id", ids);
  return (data ?? []).map((r) => r.slug);
}

/** Require at least one of the given roles; redirect if not. */
export async function requireRole(allowedRoles: Role[]): Promise<void> {
  const roles = await getUserRoles();
  const hasRole = allowedRoles.some((r) => roles.includes(r));
  if (!hasRole) redirect("/home");
}

/** Require permission; redirect if not. */
export async function requirePermission(permission: Permission): Promise<void> {
  const roles = await getUserRoles();
  if (!hasPermission(roles, permission)) redirect("/home");
}

/** Require permission to access module as teacher. Redirect if not. */
export async function requireModuleAccess(moduleId: string): Promise<void> {
  const [roles, assignedIds] = await Promise.all([
    getUserRoles(),
    getAssignedModuleIds(),
  ]);
  if (!canAccessModuleAsTeacher(roles, moduleId, assignedIds)) redirect("/teacher");
}

/** Require permission to access module by slug (resolves to id first). */
export async function requireModuleAccessBySlug(moduleSlug: string): Promise<{ moduleId: string }> {
  const supabase = await createClient();
  if (!supabase) redirect("/teacher");
  const { data: mod } = await supabase
    .from("modules")
    .select("id")
    .eq("slug", moduleSlug)
    .single();
  if (!mod) redirect("/teacher");
  await requireModuleAccess(mod.id);
  return { moduleId: mod.id };
}

export async function getCurrentRole(): Promise<Role | null> {
  const roles = await getUserRoles();
  if (roles.length === 0) return null;
  const ordered: Role[] = ["director", "admin", "teacher", "student"];
  for (const r of ordered) {
    if (roles.includes(r)) return r;
  }
  return "student";
}

export async function requireAdmin(): Promise<boolean> {
  const roles = await getUserRoles();
  return canAccessAdminPanel(roles);
}

export async function requireTeacher(): Promise<boolean> {
  const roles = await getUserRoles();
  return canAccessTeacherPanel(roles);
}

/** Active role for UI (from cookie). Used for server-rendered role-specific content. */
export async function getActiveRoleForServer(): Promise<"student" | "teacher" | "admin"> {
  const roles = await getUserRoles();
  const { cookies } = await import("next/headers");
  const store = await cookies();
  const cookie = store.get("activeRole")?.value;
  if (cookie === "student" || cookie === "teacher" || cookie === "admin") {
    const hasRole =
      (cookie === "student" && roles.includes("student")) ||
      (cookie === "teacher" && roles.includes("teacher")) ||
      (cookie === "admin" && (roles.includes("admin") || roles.includes("director")));
    if (hasRole) return cookie;
  }
  if (roles.includes("admin") || roles.includes("director")) return "admin";
  if (roles.includes("teacher")) return "teacher";
  return "student";
}
