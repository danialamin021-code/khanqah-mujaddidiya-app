"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Mark a session as completed for the current user.
 * Local test: mark complete → reload → checkmark persists.
 */
export async function markSessionComplete(
  pathId: string,
  sessionId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };
  const { error } = await supabase.from("session_completions").upsert(
    {
      user_id: user.id,
      path_id: pathId,
      session_id: sessionId,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,path_id,session_id" }
  );
  if (error) return { error: error.message };
  revalidatePath(`/paths/${pathId}`);
  revalidatePath(`/paths/${pathId}/sessions/${sessionId}`);
  revalidatePath("/profile");
  return {};
}

/**
 * Update last visited session for the current user's enrollment.
 * Call when user opens a session. Local test: open session → go to path → "Continue" shows correct session.
 */
export async function updateLastVisited(
  pathId: string,
  sessionId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };
  const { error } = await supabase
    .from("enrollments")
    .upsert(
      {
        user_id: user.id,
        path_id: pathId,
        last_visited_session_id: sessionId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,path_id" }
    );
  if (error) return { error: error.message };
  revalidatePath(`/paths/${pathId}`);
  revalidatePath("/profile");
  return {};
}
