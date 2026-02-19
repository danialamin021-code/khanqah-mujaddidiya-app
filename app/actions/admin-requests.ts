"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

const VALID_STATUSES = ["pending", "under_review", "responded"] as const;

export async function updateBayatRequestStatus(
  id: string,
  status: string,
  responseNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const canAccess = await requireAdmin();
  if (!canAccess) return { success: false, error: "Unauthorized" };

  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    return { success: false, error: "Invalid status" };
  }

  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const updates: Record<string, unknown> = {
    status,
    ...(responseNotes !== undefined && { response_notes: responseNotes.trim() || null }),
    ...(status === "responded" && {
      responded_at: new Date().toISOString(),
      responded_by: user.id,
    }),
  };

  const { error } = await supabase
    .from("bayat_requests")
    .update(updates)
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/requests");
  return { success: true };
}

export async function updateGuidanceRequestStatus(
  id: string,
  status: string,
  responseNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const canAccess = await requireAdmin();
  if (!canAccess) return { success: false, error: "Unauthorized" };

  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    return { success: false, error: "Invalid status" };
  }

  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const updates: Record<string, unknown> = {
    status,
    ...(responseNotes !== undefined && { response_notes: responseNotes.trim() || null }),
    ...(status === "responded" && {
      responded_at: new Date().toISOString(),
      responded_by: user.id,
    }),
  };

  const { error } = await supabase
    .from("guidance_requests")
    .update(updates)
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/requests");
  return { success: true };
}
