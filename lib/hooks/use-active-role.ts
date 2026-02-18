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

/**
 * Returns the active role for UI rendering.
 * - Single role: activeRole = that role.
 * - Hybrid (Teacher + Admin or Teacher + Director): activeRole from localStorage, default to admin.
 * - Only shown for switchable users (Teacher + Admin).
 */
export function useActiveRole(): {
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;
  roles: Role[];
  isHybrid: boolean;
  loading: boolean;
} {
  const { roles, loading } = useRoles();
  const [activeRole, setActiveRoleState] = useState<ActiveRole>("student");

  const isHybrid =
    (roles.includes("teacher") && (roles.includes("admin") || roles.includes("director")));

  const effectiveRole = useCallback((): ActiveRole => {
    if (roles.length === 0) return "student";
    if (roles.includes("student") && !roles.includes("teacher") && !roles.includes("admin") && !roles.includes("director")) {
      return "student";
    }
    if (roles.includes("teacher") && !roles.includes("admin") && !roles.includes("director")) {
      return "teacher";
    }
    if ((roles.includes("admin") || roles.includes("director")) && !roles.includes("teacher")) {
      return "admin";
    }
    if (isHybrid) {
      const stored = getStoredActiveRole();
      if (stored === "teacher" || stored === "admin") return stored;
      return "admin";
    }
    if (roles.includes("admin") || roles.includes("director")) return "admin";
    if (roles.includes("teacher")) return "teacher";
    return "student";
  }, [roles, isHybrid]);

  useEffect(() => {
    if (loading) return;
    setActiveRoleState(effectiveRole());
  }, [loading, effectiveRole]);

  const setActiveRole = useCallback((role: ActiveRole) => {
    setStoredActiveRole(role);
    setActiveRoleState(role);
  }, []);

  // Sync cookie on mount for hybrid users (so server can read it)
  useEffect(() => {
    if (isHybrid && !loading) {
      setStoredActiveRole(activeRole);
    }
  }, [isHybrid, loading, activeRole]);

  return {
    activeRole,
    setActiveRole,
    roles,
    isHybrid,
    loading,
  };
}
