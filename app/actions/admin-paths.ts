"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

/** Create a learning path and a default Beginner level. RLS: only admin can insert. */
export async function createPath(formData: {
  slug: string;
  title: string;
  description: string;
  introduction: string;
  sort_order: number;
}): Promise<{ error?: string }> {
  if (!(await requireAdmin())) return { error: "Forbidden." };
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured." };
  const slug = formData.slug.trim().toLowerCase().replace(/\s+/g, "-");
  const { data: path, error: pathError } = await supabase
    .from("learning_paths")
    .insert({
      slug,
      title: formData.title.trim(),
      description: formData.description.trim() || "",
      introduction: formData.introduction.trim() || "",
      sort_order: formData.sort_order ?? 0,
    })
    .select("id")
    .single();
  if (pathError || !path) return { error: pathError?.message ?? "Failed to create path." };
  const { error: levelError } = await supabase.from("levels").insert({
    path_id: path.id,
    title: "Beginner",
    sort_order: 1,
  });
  if (levelError) return { error: levelError.message };
  revalidatePath("/admin/paths");
  revalidatePath("/paths");
  revalidatePath("/home");
  return {};
}

/** Update a learning path. RLS: only admin can update. */
export async function updatePath(
  slug: string,
  formData: {
    title: string;
    description: string;
    introduction: string;
    sort_order: number;
  }
): Promise<{ error?: string }> {
  if (!(await requireAdmin())) return { error: "Forbidden." };
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured." };
  const { error } = await supabase
    .from("learning_paths")
    .update({
      title: formData.title.trim(),
      description: formData.description.trim() || "",
      introduction: formData.introduction.trim() || "",
      sort_order: formData.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug);
  if (error) return { error: error.message };
  revalidatePath("/admin/paths");
  revalidatePath(`/admin/paths/${slug}/edit`);
  revalidatePath("/paths");
  revalidatePath(`/paths/${slug}`);
  revalidatePath("/home");
  return {};
}
