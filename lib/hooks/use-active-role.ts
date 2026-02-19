"use client";

import { useCallback, useEffect, useState } from "react";
import { useRoles } from "@/lib/hooks/use-roles";
import type { Role } from "@/lib/constants/permissions";

/** Active role for UI: Student, Teacher, or Admin. Director is treated as Admin. */
export type ActiveRole = "student" | "teacher" | "admin";

const STORAGE_KEY = "activeRole";
const COOKIE_KEY = "activeRole";

function getStoredActiveRole(): ActiveRole | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "student" || stored === "teacher" || stored === "admin") return stored;
  return null;
}

function setStoredActiveRole(role: ActiveRole) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, role);
  document.cookie = `${COOKIE_KEY}=${role};path=/;max-age=31536000`;
}

/** Map DB roles to UI roles (director → admin). */
function toActiveRoles(roles: Role[]): ActiveRole[] {
  const set = new Set<ActiveRole>();
  for (const r of roles) {
    if (r === "student") set.add("student");
    if (r === "teacher") set.add("teacher");
    if (r === "admin" || r === "director") set.add("admin");
  }
  return Array.from(set);
}

/**
 * Returns the active role for UI rendering.
 * - Single role: activeRole = that role.
 * - Multiple roles: activeRole from localStorage/cookie, default to highest (admin > teacher > student).
 * - Role switcher shown for all users with 2+ roles.
 */
export function useActiveRole(): {
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;
  roles: Role[];
  /** User has 2+ switchable roles (student, teacher, admin). */
  hasMultipleRoles: boolean;
  /** Available roles for switcher (director = admin). */
  availableRoles: ActiveRole[];
  loading: boolean;
} {
  const { roles, loading } = useRoles();
  const availableRoles = toActiveRoles(roles);
  const hasMultipleRoles = availableRoles.length > 1;

  const effectiveRole = useCallback((): ActiveRole => {
    if (roles.length === 0) return "student";
    if (availableRoles.length === 1) return availableRoles[0];
    if (hasMultipleRoles) {
      const stored = getStoredActiveRole();
      if (stored && availableRoles.includes(stored)) return stored;
      return availableRoles.includes("admin") ? "admin" : availableRoles.includes("teacher") ? "teacher" : "student";
    }
    return "student";
  }, [roles, availableRoles, hasMultipleRoles]);

  const derived = effectiveRole();
  const [userOverride, setUserOverride] = useState<ActiveRole | null>(null);
  const activeRole = userOverride ?? derived;

  useEffect(() => {
    if (userOverride && !availableRoles.includes(userOverride)) {
      queueMicrotask(() => setUserOverride(null));
    }
  }, [userOverride, availableRoles]);

  useEffect(() => {
    if (loading || !hasMultipleRoles) return;
    setStoredActiveRole(derived);
  }, [loading, hasMultipleRoles, derived]);

  const setActiveRole = useCallback((role: ActiveRole) => {
    setStoredActiveRole(role);
    setUserOverride(role);
  }, []);

  return {
    activeRole,
    setActiveRole,
    roles,
    hasMultipleRoles,
    availableRoles,
    loading,
  };
}
