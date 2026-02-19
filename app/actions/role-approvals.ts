"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canAssignTeacherOrAdmin, canAssignRoles } from "@/lib/permissions";
import type { Role } from "@/lib/constants/permissions";
import { getCurrentRole } from "@/lib/auth";
import { logActivity } from "@/lib/utils/activity-logger";

/**
 * Approve a pending Teacher or Admin role request.
 * Admin can approve teacher; Director can approve teacher or admin.
 */
export async function approveRoleRequest(
  targetUserId: string,
  grantRole: "teacher" | "admin"
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  const myRoles = (myProfile?.roles ?? []) as Role[];

  if (grantRole === "admin") {
    if (!canAssignRoles(myRoles)) {
      return { success: false, error: "Only a Director can approve Admin requests" };
    }
  } else {
    if (!canAssignTeacherOrAdmin(myRoles)) {
      return { success: false, error: "Only Admin or Director can approve Teacher requests" };
    }
  }

  const { data: target } = await supabase
    .from("profiles")
    .select("roles, role_request")
    .eq("id", targetUserId)
    .single();

  if (!target) return { success: false, error: "User not found" };

  const roleRequest = (target as { role_request?: string | null }).role_request;
  const expected = grantRole === "teacher" ? "pending_teacher" : "pending_admin";
  if (roleRequest !== expected) {
    return { success: false, error: "No matching pending request" };
  }

  const currentRoles = (target as { roles?: string[] }).roles ?? ["student"];
  const newRoles = [...new Set([...currentRoles, grantRole])];

  const { error } = await supabase
    .from("profiles")
    .update({ roles: newRoles, role_request: null })
    .eq("id", targetUserId);

  if (error) return { success: false, error: error.message };

  const actorRole = (await getCurrentRole()) ?? "admin";
  await logActivity({
    actorId: user.id,
    actorRole,
    actionType: "approve_role_request",
    entityType: "user",
    entityId: targetUserId,
    description: `Approved ${grantRole} role request`,
    metadata: { grantRole, newRoles },
  });

  revalidatePath("/admin/approvals");
  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Reject a pending Teacher or Admin role request.
 */
export async function rejectRoleRequest(targetUserId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  const myRoles = (myProfile?.roles ?? []) as Role[];
  if (!canAssignTeacherOrAdmin(myRoles) && !canAssignRoles(myRoles)) {
    await logActivity({
      actorId: user.id,
      actorRole: (myRoles[0] as string) ?? "student",
      actionType: "failed_authorization",
      entityType: "user",
      entityId: targetUserId,
      description: "Reject role request: not authorized",
      metadata: { action: "reject_role_request" },
    });
    return { success: false, error: "Not authorized" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role_request: null })
    .eq("id", targetUserId);

  if (error) return { success: false, error: error.message };

  const actorRole = (await getCurrentRole()) ?? "admin";
  await logActivity({
    actorId: user.id,
    actorRole,
    actionType: "reject_role_request",
    entityType: "user",
    entityId: targetUserId,
    description: "Rejected role request",
    metadata: {},
  });

  revalidatePath("/admin/approvals");
  revalidatePath("/admin/users");
  return { success: true };
}
