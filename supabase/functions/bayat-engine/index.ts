/**
 * Bayat Engine — Edge Function
 * Handles: submitBayatRequest
 * Creates director notifications, logs activity, webhook trigger.
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

    if (action === "submit") {
      const fullName = (payload.fullName as string)?.trim();
      const whatsapp = (payload.whatsapp as string)?.trim();
      const country = (payload.country as string)?.trim() || null;
      const city = (payload.city as string)?.trim() || null;

      if (!fullName || !whatsapp) return errorResponse("fullName, whatsapp required");

      const { data, error } = await supabase
        .from("bayat_requests")
        .insert({
          user_id: user.userId,
          full_name: fullName,
          whatsapp,
          country,
          city,
          status: "pending",
        })
        .select("id")
        .single();

      if (error) return errorResponse(error.message);

      await supabase.from("system_activity_logs").insert({
        actor_id: user.userId,
        actor_role: "student",
        action_type: "create",
        entity_type: "bayat_request",
        entity_id: data?.id ?? null,
        description: "Submitted Bayat request",
        metadata: {},
      });

      const { data: directors } = await supabase
        .from("profiles")
        .select("id")
        .contains("roles", ["director"]);

      for (const d of directors ?? []) {
        const uid = (d as { id: string }).id;
        if (uid) {
          await supabase.from("notifications").insert({
            user_id: uid,
            type: "bayat_request",
            title: "New Bayat request",
            body: `${fullName} has submitted a Bayat request.`,
            metadata: { requestId: data?.id, requestType: "bayat" },
          });
        }
      }

      const webhookUrl = Deno.env.get("BAYAT_WEBHOOK_URL") || Deno.env.get("REQUEST_WEBHOOK_URL");
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "bayat",
              id: data?.id,
              fullName,
              whatsapp,
              country: country || undefined,
              city: city || undefined,
              submittedAt: new Date().toISOString(),
            }),
          });
        } catch {
          // Webhook failure non-fatal
        }
      }

      return jsonResponse({ success: true, requestId: data?.id });
    }

    return errorResponse("Unknown action");
  } catch (e) {
    console.error("[bayat-engine]", e);
    return errorResponse("Internal error", 500);
  }
});
