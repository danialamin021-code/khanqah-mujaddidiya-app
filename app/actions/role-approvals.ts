"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { invokeRoleEngine } from "@/lib/utils/invoke-edge-function";

/**
 * @deprecated Logic moved to role-engine Edge Function. This file invokes Edge Function only.
 */
export async function approveRoleRequest(
  targetUserId: string,
  grantRole: "teacher" | "admin"
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { success: false, error: "Not authenticated" };

  const result = await invokeRoleEngine(session.access_token, "approveRole", {
    targetUserId,
    grantRole,
  });

  if (result.success) {
    revalidatePath("/admin/approvals");
    revalidatePath("/admin/users");
  }
  return result;
}

/**
 * @deprecated Logic moved to role-engine Edge Function. This file invokes Edge Function only.
 */
export async function rejectRoleRequest(targetUserId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { success: false, error: "Not authenticated" };

  const result = await invokeRoleEngine(session.access_token, "rejectRole", {
    targetUserId,
  });

  if (result.success) {
    revalidatePath("/admin/approvals");
    revalidatePath("/admin/users");
  }
  return result;
}
