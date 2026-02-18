"use server";

import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/constants/permissions";
import { canAssignRoles, canAssignTeacherOrAdmin } from "@/lib/permissions";
import { getCurrentRole } from "@/lib/auth";
import { logActivity } from "@/lib/utils/activity-logger";

const VALID_ROLES: Role[] = ["student", "teacher", "admin", "director"];

/**
 * Update a user's roles. Protects Director role.
 * - Only Director can assign/remove admin or director.
 * - Admin can assign teacher or student only.
 * - Cannot remove last Director.
 * - Cannot self-promote.
 */
export async function updateUserRoles(
  targetUserId: string,
  newRoles: Role[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Cannot self-promote
  if (targetUserId === user.id) {
    return { success: false, error: "You cannot change your own roles" };
  }

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  const myRoles = (myProfile?.roles ?? []) as Role[];
  const targetHasDirector = newRoles.includes("director");
  const targetHadDirector = await (async () => {
    const { data } = await supabase
      .from("profiles")
      .select("roles")
      .eq("id", targetUserId)
      .single();
    return (data?.roles ?? []).includes("director");
  })();

  // Only Director can assign admin or director
  if (targetHasDirector || newRoles.includes("admin")) {
    if (!canAssignRoles(myRoles)) {
      return { success: false, error: "Only a Director can assign Admin or Director role" };
    }
  } else if (targetHadDirector) {
    if (!canAssignRoles(myRoles)) {
      return { success: false, error: "Only a Director can modify the Director role" };
    }
  } else if (newRoles.some((r) => r === "teacher")) {
    if (!canAssignTeacherOrAdmin(myRoles)) {
      return { success: false, error: "Only Admin or Director can assign roles" };
    }
  }

  // Cannot remove last Director
  if (targetHadDirector && !targetHasDirector) {
    const { data: directors } = await supabase
      .from("profiles")
      .select("id")
      .contains("roles", ["director"]);
    const directorCount = directors?.length ?? 0;
    if (directorCount <= 1) {
      return { success: false, error: "Cannot remove the last Director" };
    }
  }

  const sanitized = newRoles.filter((r) => VALID_ROLES.includes(r));
  if (sanitized.length === 0) return { success: false, error: "At least one role required" };

  const { error } = await supabase
    .from("profiles")
    .update({ roles: sanitized })
    .eq("id", targetUserId);

  if (error) return { success: false, error: error.message };

  const actorRole = (await getCurrentRole()) ?? "admin";
  await logActivity({
    actorId: user.id,
    actorRole,
    actionType: "update_user_roles",
    entityType: "user",
    entityId: targetUserId,
    description: `Updated user roles to: ${sanitized.join(", ")}`,
    metadata: { newRoles: sanitized },
  });

  return { success: true };
}
