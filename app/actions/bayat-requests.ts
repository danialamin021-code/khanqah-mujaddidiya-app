"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentRole } from "@/lib/auth";
import { logActivity } from "@/lib/utils/activity-logger";
import { notifyRequestWebhook } from "@/lib/utils/notify-webhook";
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rate-limit";
import { createNotification } from "@/lib/utils/notifications";
import { getDirectorIds } from "@/lib/utils/notification-targets";

export interface BayatRequestInput {
  fullName: string;
  whatsapp: string;
  country?: string;
  city?: string;
}

export async function submitBayatRequest(
  input: BayatRequestInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { max, windowMs } = RATE_LIMITS.bayat;
  if (!checkRateLimit(`bayat:${user.id}`, max, windowMs)) {
    return { success: false, error: "Too many Bayat requests. Please try again later." };
  }

  const { data, error } = await supabase
    .from("bayat_requests")
    .insert({
      user_id: user.id,
      full_name: input.fullName.trim(),
      whatsapp: input.whatsapp.trim(),
      country: input.country?.trim() || null,
      city: input.city?.trim() || null,
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
    entityType: "bayat_request",
    entityId: data?.id,
    description: "Submitted Bayat request",
    metadata: {},
  });

  await notifyRequestWebhook({
    type: "bayat",
    id: data?.id ?? "",
    fullName: input.fullName.trim(),
    whatsapp: input.whatsapp.trim(),
    country: input.country?.trim() || undefined,
    city: input.city?.trim() || undefined,
    submittedAt: new Date().toISOString(),
  });

  const directorIds = await getDirectorIds();
  await Promise.all(
    directorIds.map((uid) =>
      createNotification({
        userId: uid,
        type: "bayat_request",
        title: "New Bayat request",
        body: `${input.fullName.trim()} has submitted a Bayat request.`,
        metadata: { requestId: data?.id, requestType: "bayat" },
      })
    )
  );

  revalidatePath("/bayat");
  revalidatePath("/guidance");
  revalidatePath("/admin/requests");
  return { success: true };
}
