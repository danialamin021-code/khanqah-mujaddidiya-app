"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { invokeRoleEngine } from "@/lib/utils/invoke-edge-function";

/**
 * @deprecated Logic moved to role-engine Edge Function. This file invokes Edge Function only.
 */
export async function assignTeacher(moduleId: string, userId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Database error" };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { error: "Unauthorized" };

  const result = await invokeRoleEngine(session.access_token, "assignTeacher", {
    moduleId,
    userId,
  });

  if (result.success) {
    revalidatePath("/admin");
    revalidatePath("/admin/assignments");
    revalidatePath("/admin/modules");
    return { success: true };
  }
  return { error: result.error };
}

/**
 * @deprecated Logic moved to role-engine Edge Function. This file invokes Edge Function only.
 */
export async function unassignTeacher(moduleId: string, userId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Database error" };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { error: "Unauthorized" };

  const result = await invokeRoleEngine(session.access_token, "unassignTeacher", {
    moduleId,
    userId,
  });

  if (result.success) {
    revalidatePath("/admin");
    revalidatePath("/admin/assignments");
    revalidatePath("/admin/modules");
    return { success: true };
  }
  return { error: result.error };
}
