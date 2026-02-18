"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

/** Create a live announcement. RLS: admin only. path_slug/session_slug optional (empty = global). */
export async function createAnnouncement(formData: {
  path_slug: string | null;
  session_slug: string | null;
  title: string;
  body: string;
  sort_order: number;
}): Promise<{ error?: string }> {
  if (!(await requireAdmin())) return { error: "Forbidden." };
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured." };
  let path_id: string | null = null;
  let session_id: string | null = null;
  const pathSlug = formData.path_slug?.trim();
  const sessionSlug = formData.session_slug?.trim();
  if (pathSlug) {
    const { data: path } = await supabase.from("learning_paths").select("id").eq("slug", pathSlug).single();
    path_id = path?.id ?? null;
    if (sessionSlug && path_id) {
      const { data: session } = await supabase.from("sessions").select("id").eq("path_id", path_id).eq("slug", sessionSlug).single();
      session_id = session?.id ?? null;
    }
  }
  const { error } = await supabase.from("live_announcements").insert({
    path_id,
    session_id,
    title: formData.title.trim(),
    body: formData.body.trim() || "",
    sort_order: formData.sort_order ?? 0,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/announcements");
  revalidatePath("/paths");
  return {};
}

/** Update a live announcement. */
export async function updateAnnouncement(
  id: string,
  formData: { title: string; body: string; sort_order: number }
): Promise<{ error?: string }> {
  if (!(await requireAdmin())) return { error: "Forbidden." };
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured." };
  const { error } = await supabase
    .from("live_announcements")
    .update({
      title: formData.title.trim(),
      body: formData.body.trim() || "",
      sort_order: formData.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/announcements");
  revalidatePath("/paths");
  return {};
}

/** Delete a live announcement. */
export async function deleteAnnouncement(id: string): Promise<{ error?: string }> {
  if (!(await requireAdmin())) return { error: "Forbidden." };
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured." };
  const { error } = await supabase.from("live_announcements").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/announcements");
  revalidatePath("/paths");
  return {};
}
