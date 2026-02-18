"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, getCurrentRole } from "@/lib/auth";
import { logActivity } from "@/lib/utils/activity-logger";

export async function createModule(formData: FormData) {
  const ok = await requireAdmin();
  if (!ok) return { error: "Unauthorized" };

  const slug = (formData.get("slug") as string)?.trim().toLowerCase().replace(/\s+/g, "-");
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || "";

  if (!slug || !title) return { error: "Slug and title are required" };

  const supabase = await createClient();
  if (!supabase) return { error: "Database error" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: inserted, error } = await supabase
    .from("modules")
    .insert({
      slug,
      title,
      description,
      sort_order: 999,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  const actorRole = (await getCurrentRole()) ?? "admin";
  await logActivity({
    actorId: user.id,
    actorRole,
    actionType: "create",
    entityType: "module",
    entityId: inserted?.id ?? undefined,
    description: `Created module: ${title}`,
    metadata: { slug, title },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/modules");
  revalidatePath("/admin/assignments");
  return { success: true };
}

export async function updateModule(id: string, formData: FormData) {
  const ok = await requireAdmin();
  if (!ok) return { error: "Unauthorized" };

  const slug = (formData.get("slug") as string)?.trim().toLowerCase().replace(/\s+/g, "-");
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || "";

  if (!slug || !title) return { error: "Slug and title are required" };

  const supabase = await createClient();
  if (!supabase) return { error: "Database error" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("modules")
    .update({ slug, title, description, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("is_archived", false);

  if (error) return { error: error.message };
  const actorRole = (await getCurrentRole()) ?? "admin";
  await logActivity({
    actorId: user.id,
    actorRole,
    actionType: "update",
    entityType: "module",
    entityId: id,
    description: `Updated module: ${title}`,
    metadata: { slug, title },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/modules");
  revalidatePath(`/modules/${slug}`);
  return { success: true };
}

export async function deleteModule(id: string) {
  const ok = await requireAdmin();
  if (!ok) return { error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { error: "Database error" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: mod } = await supabase
    .from("modules")
    .select("title, slug")
    .eq("id", id)
    .single();
  if (!mod) return { error: "Module not found" };

  const { error } = await supabase
    .from("modules")
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  const actorRole = (await getCurrentRole()) ?? "admin";
  await logActivity({
    actorId: user.id,
    actorRole,
    actionType: "archive",
    entityType: "module",
    entityId: id,
    description: `Archived module: ${(mod as { title: string }).title}`,
    metadata: { slug: (mod as { slug: string }).slug },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/modules");
  revalidatePath("/admin/assignments");
  return { success: true };
}
