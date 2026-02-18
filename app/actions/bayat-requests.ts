"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentRole } from "@/lib/auth";
import { logActivity } from "@/lib/utils/activity-logger";

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

  revalidatePath("/bayat");
  revalidatePath("/guidance");
  revalidatePath("/admin/requests");
  return { success: true };
}
