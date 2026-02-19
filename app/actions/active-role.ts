"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const VALID_ACTIVE_ROLES = ["student", "teacher", "admin"] as const;
export type ActiveRole = (typeof VALID_ACTIVE_ROLES)[number];

/**
 * Set active role for UI. Stored in httpOnly cookie for security.
 * Validates that user actually has the requested role before setting.
 */
export async function setActiveRoleAction(
  role: ActiveRole
): Promise<{ success: boolean; error?: string }> {
  if (!VALID_ACTIVE_ROLES.includes(role)) {
    return { success: false, error: "Invalid role" };
  }

  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  const roles = (profile?.roles ?? []) as string[];
  const hasRole =
    (role === "student" && roles.includes("student")) ||
    (role === "teacher" && roles.includes("teacher")) ||
    (role === "admin" && (roles.includes("admin") || roles.includes("director")));

  if (!hasRole) {
    return { success: false, error: "You do not have this role" };
  }

  const store = await cookies();
  store.set("activeRole", role, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return { success: true };
}
