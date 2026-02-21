"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rate-limit";
import { invokeBayatEngine } from "@/lib/utils/invoke-edge-function";

export interface BayatRequestInput {
  fullName: string;
  whatsapp: string;
  country?: string;
  city?: string;
}

/**
 * Submit a Bayat request. All logic in bayat-engine Edge Function. No fallback.
 */
export async function submitBayatRequest(
  input: BayatRequestInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { max, windowMs } = RATE_LIMITS.bayat;
  if (!checkRateLimit(`bayat:${user.id}`, max, windowMs)) {
    return { success: false, error: "Too many Bayat requests. Please try again later." };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { success: false, error: "Not authenticated" };

  const result = await invokeBayatEngine(session.access_token, {
    fullName: input.fullName,
    whatsapp: input.whatsapp,
    country: input.country,
    city: input.city,
  });

  if (result.success) {
    revalidatePath("/bayat");
    revalidatePath("/guidance");
    revalidatePath("/admin/requests");
  }
  return { success: result.success, error: result.error };
}
