/**
 * Notification Engine — Edge Function
 * Handles: create, createRoleRequest, markRead, bulkMarkRead
 * create/createRoleRequest: internal only (X-Internal-Secret).
 * markRead/bulkMarkRead: require user auth.
 */
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";
import { getUserFromRequest } from "../_shared/auth.ts";

function isInternalCall(req: Request): boolean {
  const secret = req.headers.get("X-Internal-Secret");
  return !!secret && secret === Deno.env.get("EDGE_INTERNAL_SECRET");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action as string;
    const payload = body.payload ?? body;

    const supabase = getServiceClient();
    if (!supabase) return errorResponse("Service unavailable", 503);

    if (action === "create") {
      if (!isInternalCall(req)) return errorResponse("Unauthorized", 401);
      const { userId, type, title, body: bodyText, metadata } = body;
      if (!userId || !type || !title) return errorResponse("userId, type, title required");
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          type,
          title,
          body: bodyText ?? null,
          metadata: metadata ?? {},
        })
        .select("id")
        .single();
      if (error) return errorResponse(error.message);
      return jsonResponse({ success: true, notificationId: data?.id });
    }

    if (action === "createRoleRequest") {
      if (!isInternalCall(req)) return errorResponse("Unauthorized", 401);
      const role = payload.role as "teacher" | "admin";
      const email = (payload.email as string)?.trim();
      if (!role || !email) return errorResponse("role, email required");
      if (!["teacher", "admin"].includes(role)) return errorResponse("Invalid role");

      const roleLabel = role === "teacher" ? "Teacher" : "Admin";
      const title = `New ${roleLabel} role request`;
      const bodyText = `${email} has requested the ${roleLabel} role. Review in Admin → Approvals.`;
      const metadata = { requestType: role, email };

      if (role === "admin") {
        const { data: directors } = await supabase.from("profiles").select("id").contains("roles", ["director"]);
        for (const d of directors ?? []) {
          const uid = (d as { id: string }).id;
          if (uid) await supabase.from("notifications").insert({ user_id: uid, type: "admin_request", title, body: bodyText, metadata });
        }
      } else {
        const { data: admins } = await supabase.from("profiles").select("id").or("roles.cs.{admin},roles.cs.{director}");
        for (const a of admins ?? []) {
          const uid = (a as { id: string }).id;
          if (uid) await supabase.from("notifications").insert({ user_id: uid, type: "teacher_request", title, body: bodyText, metadata });
        }
      }
      return jsonResponse({ success: true });
    }

    if (action === "markRead" || action === "bulkMarkRead") {
      const user = await getUserFromRequest(req);
      if (!user) return errorResponse("Unauthorized", 401);

      if (action === "markRead") {
        const notificationId = payload.notificationId as string;
        if (!notificationId) return errorResponse("notificationId required");
        const { error } = await supabase
          .from("notifications")
          .update({ read_at: new Date().toISOString() })
          .eq("id", notificationId)
          .eq("user_id", user.userId);
        if (error) return errorResponse(error.message);
        return jsonResponse({ success: true });
      }

      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", user.userId)
        .is("read_at", null);
      if (error) return errorResponse(error.message);
      return jsonResponse({ success: true });
    }

    return errorResponse("Unknown action");
  } catch (e) {
    console.error("[notification-engine]", e);
    return errorResponse("Internal error", 500);
  }
});
