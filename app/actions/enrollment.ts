"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Enroll the current user in a learning path.
 * Local test: click Enroll on path detail → reload → enrollment persists.
 */
export async function enrollInPath(pathId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Supabase not configured." };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to enroll." };
  }
  const { error } = await supabase.from("enrollments").upsert(
    {
      user_id: user.id,
      path_id: pathId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,path_id" }
  );
  if (error) return { error: error.message };
  revalidatePath("/paths");
  revalidatePath(`/paths/${pathId}`);
  revalidatePath("/profile");
  return {};
}
