"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rate-limit";
import { invokeAttendanceEngine } from "@/lib/utils/invoke-edge-function";

/**
 * Mark or update batch attendance.
 * All logic in attendance-engine Edge Function. No fallback.
 */
export async function markBatchAttendance(
  batchSessionId: string,
  userId: string,
  status: "present" | "absent" | "late"
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Database error" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (!checkRateLimit(`attendance:${user.id}`, RATE_LIMITS.attendance_marking.max, RATE_LIMITS.attendance_marking.windowMs)) {
    return { success: false, error: "Too many attendance updates. Please try again later." };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { success: false, error: "Not authenticated" };

  const result = await invokeAttendanceEngine(session.access_token, "mark", {
    batchSessionId,
    userId,
    status,
  });

  if (result.success) {
    const { data: s } = await supabase.from("batch_sessions").select("batch_id").eq("id", batchSessionId).single();
    if (s) {
      revalidatePath("/teacher");
      revalidatePath(`/teacher/batches/${s.batch_id}`);
    }
  }
  return { success: result.success, error: result.error };
}

/**
 * Bulk mark present for multiple users in a batch session.
 * All logic in attendance-engine Edge Function. No fallback.
 */
export async function bulkMarkPresent(
  batchSessionId: string,
  userIds: string[]
): Promise<{ success: boolean; error?: string; marked?: number }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Database error" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { success: false, error: "Not authenticated" };

  const result = await invokeAttendanceEngine(session.access_token, "bulk_mark", {
    batchSessionId,
    userIds,
  });

  if (result.success) revalidatePath("/teacher");
  return result;
}
