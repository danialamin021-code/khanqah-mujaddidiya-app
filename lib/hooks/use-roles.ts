"use client";

import { useEffect, useState } from "react";
import type { Role } from "@/lib/constants/permissions";
import { createClient } from "@/lib/supabase/client";

const VALID_ROLES: Role[] = ["student", "teacher", "admin", "director"];

/**
 * Returns current user roles and assigned module IDs for client-side permission checks.
 * Single source of truth: roles[] only.
 */
export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [assignedModuleIds, setAssignedModuleIds] = useState<string[]>([]);
  const [assignedModuleSlugs, setAssignedModuleSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setRoles(["student"]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setRoles([]);
        setAssignedModuleIds([]);
        setAssignedModuleSlugs([]);
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("roles")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        setRoles(["student"]);
        setLoading(false);
        return;
      }

      const rolesRaw = (profile as { roles?: string[] }).roles;
      const r: Role[] = Array.isArray(rolesRaw)
        ? rolesRaw.filter((x): x is Role => VALID_ROLES.includes(x as Role))
        : ["student"];
      setRoles(r);

      const { data: assignments, error: err } = await supabase
        .from("module_teachers")
        .select("module_id")
        .eq("user_id", user.id);

      const ids = err ? [] : (assignments ?? []).map((a) => a.module_id);
      setAssignedModuleIds(ids);

      if (ids.length > 0) {
        const { data: mods } = await supabase
          .from("modules")
          .select("slug")
          .in("id", ids);
        setAssignedModuleSlugs((mods ?? []).map((m) => m.slug));
      } else {
        setAssignedModuleSlugs([]);
      }
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchRoles();
    });

    fetchRoles();
    return () => subscription.unsubscribe();
  }, []);

  return { roles, assignedModuleIds, assignedModuleSlugs, loading };
}
