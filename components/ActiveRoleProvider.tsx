"use client";

import { createContext, useContext, useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRoles } from "@/lib/hooks/use-roles";
import { setActiveRoleAction } from "@/app/actions/active-role";
import type { Role } from "@/lib/constants/permissions";

export type ActiveRole = "student" | "teacher" | "admin";

function toActiveRoles(roles: Role[]): ActiveRole[] {
  const set = new Set<ActiveRole>();
  for (const r of roles) {
    if (r === "student") set.add("student");
    if (r === "teacher") set.add("teacher");
    if (r === "admin" || r === "director") set.add("admin");
  }
  return Array.from(set);
}

type ActiveRoleContextValue = {
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => Promise<void>;
  roles: Role[];
  hasMultipleRoles: boolean;
  availableRoles: ActiveRole[];
  loading: boolean;
};

const ActiveRoleContext = createContext<ActiveRoleContextValue | null>(null);

export function ActiveRoleProvider({
  children,
  initialRole,
}: {
  children: React.ReactNode;
  initialRole: ActiveRole;
}) {
  const { roles, loading } = useRoles();
  const router = useRouter();
  const availableRoles = toActiveRoles(roles);
  const hasMultipleRoles = availableRoles.length > 1;

  const derived: ActiveRole =
    roles.length === 0
      ? "student"
      : availableRoles.length === 1
        ? availableRoles[0]
        : availableRoles.includes(initialRole)
          ? initialRole
          : availableRoles.includes("admin")
            ? "admin"
            : availableRoles.includes("teacher")
              ? "teacher"
              : "student";

  const [userOverride, setUserOverride] = useState<ActiveRole | null>(null);
  const activeRole = userOverride ?? derived;

  useEffect(() => {
    if (userOverride && !availableRoles.includes(userOverride)) {
      queueMicrotask(() => setUserOverride(null));
    }
  }, [userOverride, availableRoles]);

  const setActiveRole = useCallback(
    async (role: ActiveRole) => {
      setUserOverride(role);
      const result = await setActiveRoleAction(role);
      if (result.success) {
        router.refresh();
      } else {
        setUserOverride(null);
      }
    },
    [router]
  );

  return (
    <ActiveRoleContext.Provider
      value={{
        activeRole,
        setActiveRole,
        roles,
        hasMultipleRoles,
        availableRoles,
        loading,
      }}
    >
      {children}
    </ActiveRoleContext.Provider>
  );
}

export function useActiveRole(): ActiveRoleContextValue {
  const ctx = useContext(ActiveRoleContext);
  if (!ctx) {
    throw new Error("useActiveRole must be used within ActiveRoleProvider");
  }
  return ctx;
}
