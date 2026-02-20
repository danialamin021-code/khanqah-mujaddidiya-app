"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * Sign out and clear push tokens. Call before client-side signOut.
 */
export async function logoutAndClearTokens(): Promise<void> {
  const supabase = await createClient();
  if (!supabase) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const service = createServiceClient();
    if (service) {
      await service.from("push_tokens").delete().eq("user_id", user.id);
    }
  }
}
