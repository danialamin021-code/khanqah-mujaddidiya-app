/**
 * Academic Engine — Edge Function
 * Handles: createBatch, updateBatch, createBatchSession
 * Admin/Director for batch CRUD; Teacher for session creation.
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
    const payload = body.payload ?? body;

    const supabase = getServiceClient();
    if (!supabase) return errorResponse("Service unavailable", 503);

    const { data: profile } = await supabase.from("profiles").select("roles").eq("id", user.userId).single();
    const roles = (profile?.roles ?? []) as string[];
    const isAdminOrDirector = roles.includes("admin") || roles.includes("director");

    if (action === "createBatch") {
      if (!isAdminOrDirector) return errorResponse("Unauthorized");

      const moduleId = payload.moduleId as string;
      const name = (payload.name as string)?.trim();
      if (!moduleId || !name) return errorResponse("moduleId, name required");

      const { data: inserted, error } = await supabase
        .from("batches")
        .insert({
          module_id: moduleId,
          name,
          description: (payload.description as string)?.trim() || null,
          start_date: payload.startDate || null,
          end_date: payload.endDate || null,
          teacher_id: payload.teacherId || null,
          whatsapp_group_link: (payload.whatsappGroupLink as string)?.trim() || null,
          price: payload.price ?? 0,
          currency: payload.currency ?? "PKR",
          is_paid: payload.isPaid ?? false,
          is_active: true,
        })
        .select("id")
        .single();

      if (error) return errorResponse(error.message);

      await supabase.from("system_activity_logs").insert({
        actor_id: user.userId,
        actor_role: roles[0] ?? "admin",
        action_type: "create",
        entity_type: "batch",
        entity_id: inserted?.id ?? null,
        description: `Created batch: ${name}`,
        metadata: { batchId: inserted?.id },
      });

      return jsonResponse({ success: true, batchId: inserted?.id });
    }

    if (action === "updateBatch") {
      if (!isAdminOrDirector) return errorResponse("Unauthorized");

      const batchId = payload.batchId as string;
      if (!batchId) return errorResponse("batchId required");

      const updates: Record<string, unknown> = {};
      if (payload.name !== undefined) updates.name = (payload.name as string).trim();
      if (payload.description !== undefined) updates.description = (payload.description as string)?.trim() || null;
      if (payload.startDate !== undefined) updates.start_date = payload.startDate || null;
      if (payload.endDate !== undefined) updates.end_date = payload.endDate || null;
      if (payload.teacherId !== undefined) updates.teacher_id = payload.teacherId || null;
      if (payload.whatsappGroupLink !== undefined) updates.whatsapp_group_link = (payload.whatsappGroupLink as string)?.trim() || null;
      if (payload.price !== undefined) updates.price = payload.price;
      if (payload.currency !== undefined) updates.currency = payload.currency;
      if (payload.isPaid !== undefined) updates.is_paid = payload.isPaid;
      if (payload.isActive !== undefined) updates.is_active = payload.isActive;

      const { error } = await supabase.from("batches").update(updates).eq("id", batchId);
      if (error) return errorResponse(error.message);

      await supabase.from("system_activity_logs").insert({
        actor_id: user.userId,
        actor_role: roles[0] ?? "admin",
        action_type: "update",
        entity_type: "batch",
        entity_id: batchId,
        description: "Updated batch",
        metadata: { batchId },
      });

      return jsonResponse({ success: true });
    }

    if (action === "createBatchSession") {
      const batchId = payload.batchId as string;
      const title = (payload.title as string)?.trim();
      const sessionDate = payload.sessionDate as string;
      if (!batchId || !title || !sessionDate) return errorResponse("batchId, title, sessionDate required");

      const { data: batch } = await supabase.from("batches").select("id, teacher_id").eq("id", batchId).single();
      if (!batch) return errorResponse("Batch not found");

      const isTeacher = batch.teacher_id === user.userId;
      if (!isTeacher && !isAdminOrDirector) return errorResponse("Unauthorized");

      const { data: inserted, error } = await supabase
        .from("batch_sessions")
        .insert({
          batch_id: batchId,
          title,
          session_date: sessionDate,
          zoom_link: (payload.zoomLink as string)?.trim() || null,
          topic: (payload.topic as string)?.trim() || null,
        })
        .select("id")
        .single();

      if (error) return errorResponse(error.message);

      await supabase.rpc("recalculate_batch_participation_all", { p_batch_id: batchId });

      return jsonResponse({ success: true, sessionId: inserted?.id });
    }

    return errorResponse("Unknown action");
  } catch (e) {
    console.error("[academic-engine]", e);
    return errorResponse("Internal error", 500);
  }
});
