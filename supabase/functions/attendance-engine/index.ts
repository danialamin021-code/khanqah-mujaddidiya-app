/**
 * Attendance Engine — Edge Function
 * Handles: markBatchAttendance, bulkMarkPresent
 * Uses service role. Validates teacher/admin via Bearer token.
 */
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";
import { getUserFromRequest } from "../_shared/auth.ts";

const ATTENDANCE_THRESHOLD_PERCENT = 50;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) return errorResponse("Unauthorized", 401);

    const body = await req.json().catch(() => ({}));
    const action = body.action as string;

    const supabase = getServiceClient();
    if (!supabase) return errorResponse("Service unavailable", 503);

    if (action === "mark") {
      const batchSessionId = body.batchSessionId as string;
      const studentUserId = body.userId as string;
      const status = body.status as "present" | "absent" | "late";
      if (!batchSessionId || !studentUserId || !status) {
        return errorResponse("batchSessionId, userId, status required");
      }
      if (!["present", "absent", "late"].includes(status)) {
        return errorResponse("Invalid status");
      }

      const { data: session } = await supabase
        .from("batch_sessions")
        .select("id, batch_id")
        .eq("id", batchSessionId)
        .single();
      if (!session) return errorResponse("Session not found");

      const { data: batch } = await supabase
        .from("batches")
        .select("id, teacher_id, name")
        .eq("id", session.batch_id)
        .single();
      if (!batch) return errorResponse("Batch not found");

      const isTeacher = batch.teacher_id === user.userId;
      const { data: profile } = await supabase
        .from("profiles")
        .select("roles")
        .eq("id", user.userId)
        .single();
      const roles = (profile?.roles ?? []) as string[];
      const isAdminOrDirector = roles.includes("admin") || roles.includes("director");
      if (!isTeacher && !isAdminOrDirector) return errorResponse("Unauthorized");

      const { error: upsertError } = await supabase
        .from("batch_attendance")
        .upsert(
          {
            batch_session_id: batchSessionId,
            user_id: studentUserId,
            status,
            marked_by: user.userId,
          },
          { onConflict: "batch_session_id,user_id" }
        );
      if (upsertError) return errorResponse(upsertError.message);

      await supabase.rpc("recalculate_batch_participation", {
        p_batch_id: session.batch_id,
        p_user_id: studentUserId,
      });

      await supabase.from("system_activity_logs").insert({
        actor_id: user.userId,
        actor_role: isAdminOrDirector ? "admin" : "teacher",
        action_type: "mark_attendance",
        entity_type: "batch_attendance",
        entity_id: batchSessionId,
        description: `Marked ${status} for student in batch`,
        metadata: { batchSessionId, userId: studentUserId, status, batchId: session.batch_id },
      });

      const { data: participation } = await supabase
        .from("batch_participation")
        .select("attendance_percentage")
        .eq("batch_id", session.batch_id)
        .eq("user_id", studentUserId)
        .single();

      const pct = participation?.attendance_percentage ?? 0;
      const batchName = (batch as { name: string }).name;
      if (pct < ATTENDANCE_THRESHOLD_PERCENT && pct > 0) {
        await supabase.from("notifications").insert({
          user_id: studentUserId,
          type: "attendance_below_threshold",
          title: "Attendance reminder",
          body: `Your attendance in ${batchName} is below ${ATTENDANCE_THRESHOLD_PERCENT}%. Please try to attend more sessions.`,
          metadata: { batchId: session.batch_id, percentage: pct },
        });
      }

      return jsonResponse({ success: true });
    }

    if (action === "bulk_mark") {
      const batchSessionId = body.batchSessionId as string;
      const userIds = body.userIds as string[];
      if (!batchSessionId || !Array.isArray(userIds)) {
        return errorResponse("batchSessionId, userIds required");
      }

      const { data: session } = await supabase
        .from("batch_sessions")
        .select("id, batch_id")
        .eq("id", batchSessionId)
        .single();
      if (!session) return errorResponse("Session not found");

      const { data: batch } = await supabase
        .from("batches")
        .select("teacher_id")
        .eq("id", session.batch_id)
        .single();
      if (!batch || batch.teacher_id !== user.userId) return errorResponse("Unauthorized");

      let marked = 0;
      for (const studentUserId of userIds) {
        const { error: upsertError } = await supabase
          .from("batch_attendance")
          .upsert(
            {
              batch_session_id: batchSessionId,
              user_id: studentUserId,
              status: "present",
              marked_by: user.userId,
            },
            { onConflict: "batch_session_id,user_id" }
          );
        if (!upsertError) {
          marked++;
          await supabase.rpc("recalculate_batch_participation", {
            p_batch_id: session.batch_id,
            p_user_id: studentUserId,
          });
        }
      }
      return jsonResponse({ success: true, marked });
    }

    return errorResponse("Unknown action");
  } catch (e) {
    console.error("[attendance-engine]", e);
    return errorResponse("Internal error", 500);
  }
});
