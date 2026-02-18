"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

const SESSION_TYPES = ["reading", "audio", "practice", "announcement"] as const;

/** Create a session. RLS: only admin. level_id and path_id from path uuid. */
export async function createSession(
  pathId: string,
  levelId: string,
  formData: {
    slug: string;
    title: string;
    type: string;
    description: string;
    body: string;
    sort_order: number;
  }
): Promise<{ error?: string }> {
  if (!(await requireAdmin())) return { error: "Forbidden." };
  const type = SESSION_TYPES.includes(formData.type as (typeof SESSION_TYPES)[number])
    ? formData.type
    : "reading";
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured." };
  const { error } = await supabase.from("sessions").insert({
    path_id: pathId,
    level_id: levelId,
    slug: formData.slug.trim().toLowerCase().replace(/\s+/g, "-"),
    title: formData.title.trim(),
    type,
    description: formData.description.trim() || null,
    body: formData.body.trim() || null,
    sort_order: formData.sort_order ?? 0,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/paths");
  revalidatePath("/paths");
  revalidatePath(`/paths/${pathId}`);
  return {};
}

/** Update a session. RLS: only admin. Identify by path slug + session slug. */
export async function updateSession(
  pathSlug: string,
  sessionSlug: string,
  formData: {
    title: string;
    type: string;
    description: string;
    body: string;
    sort_order: number;
  }
): Promise<{ error?: string }> {
  if (!(await requireAdmin())) return { error: "Forbidden." };
  const type = SESSION_TYPES.includes(formData.type as (typeof SESSION_TYPES)[number])
    ? formData.type
    : "reading";
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured." };
  const { data: path } = await supabase
    .from("learning_paths")
    .select("id")
    .eq("slug", pathSlug)
    .single();
  if (!path) return { error: "Path not found." };
  const { error } = await supabase
    .from("sessions")
    .update({
      title: formData.title.trim(),
      type,
      description: formData.description.trim() || null,
      body: formData.body.trim() || null,
      sort_order: formData.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq("path_id", path.id)
    .eq("slug", sessionSlug);
  if (error) return { error: error.message };
  revalidatePath("/admin/paths");
  revalidatePath("/paths");
  revalidatePath(`/paths/${pathSlug}`);
  revalidatePath(`/paths/${pathSlug}/sessions/${sessionSlug}`);
  return {};
}
