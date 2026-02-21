"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, getCurrentRole } from "@/lib/auth";
import { logActivity } from "@/lib/utils/activity-logger";
import { createNotification } from "@/lib/utils/notifications";

export async function assignTeacher(moduleId: string, userId: string) {
  const ok = await requireAdmin();
  if (!ok) return { error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { error: "Database error" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("module_teachers").insert({
    module_id: moduleId,
    user_id: userId,
  });

  if (error) return { error: error.message };

  const { data: mod } = await supabase
    .from("modules")
    .select("title, slug")
    .eq("id", moduleId)
    .single();
  const moduleTitle = (mod as { title?: string } | null)?.title ?? "a module";
  const moduleSlug = (mod as { slug?: string } | null)?.slug ?? "";

  const actorRole = (await getCurrentRole()) ?? "admin";
  await logActivity({
    actorId: user.id,
    actorRole,
    actionType: "assign_teacher",
    entityType: "module",
    entityId: moduleId,
    description: "Assigned teacher to module",
    metadata: { teacherUserId: userId },
  });

  await createNotification({
    userId,
    type: "module_assignment",
    title: "Module assignment",
    body: `You have been assigned to teach ${moduleTitle}.`,
    metadata: { moduleId, moduleSlug },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/assignments");
  revalidatePath("/admin/modules");
  return { success: true };
}

export async function unassignTeacher(moduleId: string, userId: string) {
  const ok = await requireAdmin();
  if (!ok) return { error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { error: "Database error" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Invariant: module must have at least 1 teacher
  const { data: teachers } = await supabase
    .from("module_teachers")
    .select("user_id")
    .eq("module_id", moduleId);
  const count = teachers?.length ?? 0;
  if (count <= 1) {
    return { error: "Cannot remove the last teacher. Module must have at least one teacher." };
  }

  const { error } = await supabase
    .from("module_teachers")
    .delete()
    .eq("module_id", moduleId)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  const actorRole = (await getCurrentRole()) ?? "admin";
  await logActivity({
    actorId: user.id,
    actorRole,
    actionType: "unassign_teacher",
    entityType: "module",
    entityId: moduleId,
    description: "Unassigned teacher from module",
    metadata: { teacherUserId: userId },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/assignments");
  revalidatePath("/admin/modules");
  return { success: true };
}
