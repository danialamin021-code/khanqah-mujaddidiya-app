/**
 * Enrollment Engine — Edge Function
 * Handles: enrollInBatch, markJoinedWhatsApp
 * Uses service role. Validates user via Bearer token.
 * Transaction-safe: duplicate enrollment returns success (idempotent).
 */
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";
import { getUserFromRequest } from "../_shared/auth.ts";

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

    if (action === "enroll") {
      const batchId = body.batchId as string;
      const metadata = body.metadata as { fullName?: string; whatsapp?: string; country?: string; city?: string } | undefined;
      if (!batchId || typeof batchId !== "string") {
        return errorResponse("batchId required");
      }

      const { data: batch } = await supabase
        .from("batches")
        .select("id, name, teacher_id, module_id, whatsapp_group_link")
        .eq("id", batchId)
        .eq("is_active", true)
        .single();

      if (!batch) return errorResponse("Batch not found or inactive");

      const { data: inserted, error } = await supabase
        .from("batch_enrollments")
        .insert({
          batch_id: batchId,
          user_id: user.userId,
          full_name: metadata?.fullName?.trim() || null,
          whatsapp: metadata?.whatsapp?.trim() || null,
          country: metadata?.country?.trim() || null,
          city: metadata?.city?.trim() || null,
          enrollment_status: "active",
        })
        .select("id")
        .single();

      if (error) {
        if (error.code === "23505") {
          return jsonResponse({ success: true, alreadyEnrolled: true });
        }
        return errorResponse(error.message);
      }

      const batchName = (batch as { name: string }).name;

      await supabase.from("system_activity_logs").insert({
        actor_id: user.userId,
        actor_role: "student",
        action_type: "create",
        entity_type: "batch_enrollment",
        entity_id: inserted?.id ?? null,
        description: `Enrolled in batch: ${batchName}`,
        metadata: { batchId },
      });

      const teacherIds: string[] = [];
      const adminIds: string[] = [];
      if (batch.teacher_id) teacherIds.push(batch.teacher_id);

      const { data: adminProfiles } = await supabase
        .from("profiles")
        .select("id")
        .or("roles.cs.{admin},roles.cs.{director}");
      for (const p of adminProfiles ?? []) {
        const id = (p as { id: string }).id;
        if (id && !teacherIds.includes(id)) adminIds.push(id);
      }

      const notifications: { user_id: string; type: string; title: string; body: string; metadata: Record<string, unknown> }[] = [
        { user_id: user.userId, type: "batch_enrollment", title: "Enrollment successful", body: `Welcome to ${batchName}.`, metadata: { batchId } },
        ...teacherIds.map((uid) => ({ user_id: uid, type: "new_enrollment", title: "New batch enrollment", body: `A student enrolled in ${batchName}.`, metadata: { batchId, studentId: user.userId })),
        ...adminIds.map((uid) => ({ user_id: uid, type: "enrollment_new", title: "New batch enrollment", body: `A student enrolled in ${batchName}.`, metadata: { batchId, studentId: user.userId })),
      ];

      for (const n of notifications) {
        await supabase.from("notifications").insert({
          user_id: n.user_id,
          type: n.type,
          title: n.title,
          body: n.body,
          metadata: n.metadata,
        });
      }

      return jsonResponse({ success: true });
    }

    if (action === "mark_whatsapp_joined") {
      const batchId = body.batchId as string;
      if (!batchId || typeof batchId !== "string") {
        return errorResponse("batchId required");
      }
      const { error } = await supabase
        .from("batch_enrollments")
        .update({ joined_whatsapp: true })
        .eq("batch_id", batchId)
        .eq("user_id", user.userId);
      if (error) return errorResponse(error.message);
      return jsonResponse({ success: true });
    }

    return errorResponse("Unknown action");
  } catch (e) {
    console.error("[enrollment-engine]", e);
    return errorResponse("Internal error", 500);
  }
});
