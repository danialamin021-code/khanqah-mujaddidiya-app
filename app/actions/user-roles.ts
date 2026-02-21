"use server";

import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/constants/permissions";
import { invokeRoleEngine } from "@/lib/utils/invoke-edge-function";

/**
 * @deprecated Logic moved to role-engine Edge Function. This file invokes Edge Function only.
 */
export async function updateUserRoles(
  targetUserId: string,
  newRoles: Role[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { success: false, error: "Not authenticated" };

  return invokeRoleEngine(session.access_token, "updateUserRoles", {
    targetUserId,
    newRoles,
  });
}
