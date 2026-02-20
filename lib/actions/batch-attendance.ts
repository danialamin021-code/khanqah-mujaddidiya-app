"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getCurrentRole } from "@/lib/auth";
import { logActivity } from "@/lib/utils/activity-logger";
import { createNotification } from "@/lib/utils/notifications";
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rate-limit";

const ATTENDANCE_THRESHOLD_PERCENT = 50;

/**
 * Mark or update batch attendance. Triggers participation recalculation.
 * Teacher of batch only. Runs in transaction-like flow (recalc via RPC).
 */
export async function markBatchAttendance(
  batchSessionId: string,
  userId: string,
  status: "present" | "absent" | "late"
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Database error" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (!checkRateLimit(`attendance:${user.id}`, RATE_LIMITS.attendance_marking.max, RATE_LIMITS.attendance_marking.windowMs)) {
    return { success: false, error: "Too many attendance updates. Please try again later." };
  }

  const { data: session } = await supabase
    .from("batch_sessions")
    .select("id, batch_id")
    .eq("id", batchSessionId)
    .single();
  if (!session) return { success: false, error: "Session not found" };

  const { data: batch } = await supabase
    .from("batches")
    .select("id, teacher_id, name")
    .eq("id", session.batch_id)
    .single();
  if (!batch) return { success: false, error: "Batch not found" };

  const isTeacher = batch.teacher_id === user.id;
  const role = await getCurrentRole();
  const isAdminOrDirector = role === "admin" || role === "director";
  if (!isTeacher && !isAdminOrDirector) return { success: false, error: "Unauthorized" };

  const { error: upsertError } = await supabase
    .from("batch_attendance")
    .upsert(
      {
        batch_session_id: batchSessionId,
        user_id: userId,
        status,
        marked_by: user.id,
      },
      { onConflict: "batch_session_id,user_id" }
    );

  if (upsertError) return { success: false, error: upsertError.message };

  const serviceClient = createServiceClient();
  if (serviceClient) {
    await serviceClient.rpc("recalculate_batch_participation", {
      p_batch_id: session.batch_id,
      p_user_id: userId,
    });
  }

  const actorRole = (await getCurrentRole()) ?? "teacher";
  await logActivity({
    actorId: user.id,
    actorRole,
    actionType: "mark_attendance",
    entityType: "batch_attendance",
    entityId: batchSessionId,
    description: `Marked ${status} for student in batch`,
    metadata: { batchSessionId, userId, status, batchId: session.batch_id },
  });

  const { data: participation } = await supabase
    .from("batch_participation")
    .select("attendance_percentage")
    .eq("batch_id", session.batch_id)
    .eq("user_id", userId)
    .single();

  const pct = participation?.attendance_percentage ?? 0;
  if (pct < ATTENDANCE_THRESHOLD_PERCENT && pct > 0) {
    await createNotification({
      userId,
      type: "attendance_below_threshold",
      title: "Attendance reminder",
      body: `Your attendance in ${(batch as { name: string }).name} is below ${ATTENDANCE_THRESHOLD_PERCENT}%. Please try to attend more sessions.`,
      metadata: { batchId: session.batch_id, percentage: pct },
    });
  }

  revalidatePath("/teacher");
  revalidatePath(`/teacher/batches/${session.batch_id}`);
  return { success: true };
}

/**
 * Bulk mark present for multiple users in a batch session.
 */
export async function bulkMarkPresent(
  batchSessionId: string,
  userIds: string[]
): Promise<{ success: boolean; error?: string; marked?: number }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Database error" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: session } = await supabase
    .from("batch_sessions")
    .select("id, batch_id")
    .eq("id", batchSessionId)
    .single();
  if (!session) return { success: false, error: "Session not found" };

  const { data: batch } = await supabase
    .from("batches")
    .select("teacher_id")
    .eq("id", session.batch_id)
    .single();
  if (!batch || batch.teacher_id !== user.id) return { success: false, error: "Unauthorized" };

  let marked = 0;
  for (const uid of userIds) {
    const result = await markBatchAttendance(batchSessionId, uid, "present");
    if (result.success) marked++;
  }

  revalidatePath("/teacher");
  return { success: true, marked };
}
