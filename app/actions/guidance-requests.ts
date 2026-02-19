"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentRole } from "@/lib/auth";
import { logActivity } from "@/lib/utils/activity-logger";
import { notifyRequestWebhook } from "@/lib/utils/notify-webhook";
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rate-limit";

export interface GuidanceRequestInput {
  fullName: string;
  whatsapp: string;
  country?: string;
  city?: string;
  message?: string;
}

export async function submitGuidanceRequest(
  input: GuidanceRequestInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { max, windowMs } = RATE_LIMITS.guidance;
  if (!checkRateLimit(`guidance:${user.id}`, max, windowMs)) {
    return { success: false, error: "Too many Guidance requests. Please try again later." };
  }

  const { data, error } = await supabase
    .from("guidance_requests")
    .insert({
      user_id: user.id,
      full_name: input.fullName.trim(),
      whatsapp: input.whatsapp.trim(),
      country: input.country?.trim() || null,
      city: input.city?.trim() || null,
      message: input.message?.trim() || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  const actorRole = (await getCurrentRole()) ?? "student";
  await logActivity({
    actorId: user.id,
    actorRole,
    actionType: "create",
    entityType: "guidance_request",
    entityId: data?.id,
    description: "Submitted Guidance request",
    metadata: {},
  });

  await notifyRequestWebhook({
    type: "guidance",
    id: data?.id ?? "",
    fullName: input.fullName.trim(),
    whatsapp: input.whatsapp.trim(),
    country: input.country?.trim() || undefined,
    city: input.city?.trim() || undefined,
    message: input.message?.trim() || undefined,
    submittedAt: new Date().toISOString(),
  });

  revalidatePath("/guidance");
  revalidatePath("/admin/requests");
  return { success: true };
}
