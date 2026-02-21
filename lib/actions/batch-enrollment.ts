"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rate-limit";
import { invokeEnrollmentEngine } from "@/lib/utils/invoke-edge-function";

export interface BatchEnrollMetadata {
  fullName: string;
  whatsapp: string;
  country?: string;
  city?: string;
}

/**
 * Enroll the current user in a batch.
 * All logic in enrollment-engine Edge Function. No fallback.
 */
export async function enrollInBatch(
  batchId: string,
  metadata?: BatchEnrollMetadata
): Promise<{ success: boolean; error?: string; alreadyEnrolled?: boolean }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { max, windowMs } = RATE_LIMITS.enrollment;
  if (!checkRateLimit(`batch_enrollment:${user.id}`, max, windowMs)) {
    return { success: false, error: "Too many enrollment attempts. Please try again later." };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { success: false, error: "Not authenticated" };

  const result = await invokeEnrollmentEngine(session.access_token, "enroll", {
    batchId,
    metadata: metadata ? { fullName: metadata.fullName, whatsapp: metadata.whatsapp, country: metadata.country, city: metadata.city } : undefined,
  });

  if (result.success) {
    revalidatePath("/batches");
    revalidatePath(`/batches/${batchId}`);
    revalidatePath("/modules");
    revalidatePath("/profile");
  }
  return result;
}

/**
 * Mark that the user has joined the WhatsApp group.
 * All logic in enrollment-engine Edge Function. No fallback.
 */
export async function markJoinedWhatsApp(batchId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { success: false, error: "Not authenticated" };

  const result = await invokeEnrollmentEngine(session.access_token, "mark_whatsapp_joined", { batchId });

  if (result.success) {
    revalidatePath(`/batches/${batchId}`);
    revalidatePath("/profile");
  }
  return { success: result.success, error: result.error };
}
