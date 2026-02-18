"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, getAssignedModuleIds } from "@/lib/auth";

export async function createModuleAnnouncement(
  moduleId: string,
  data: { title: string; content: string }
) {
  const supabase = await createClient();
  if (!supabase) return { error: "Database error" };

  const isAdmin = await requireAdmin();
  const assignedIds = await getAssignedModuleIds();
  const canWrite = isAdmin || assignedIds.includes(moduleId);
  if (!canWrite) return { error: "Unauthorized" };

  const { error } = await supabase.from("module_announcements").insert({
    module_id: moduleId,
    title: data.title.trim(),
    content: data.content?.trim() || "",
  });

  if (error) return { error: error.message };
  revalidatePath(`/teacher`);
  revalidatePath(`/modules`);
  return { success: true };
}

export async function updateModuleAnnouncement(
  announcementId: string,
  data: { title?: string; content?: string }
) {
  const supabase = await createClient();
  if (!supabase) return { error: "Database error" };

  const { data: ann } = await supabase
    .from("module_announcements")
    .select("module_id")
    .eq("id", announcementId)
    .single();
  if (!ann) return { error: "Announcement not found" };

  const isAdmin = await requireAdmin();
  const assignedIds = await getAssignedModuleIds();
  const canWrite = isAdmin || assignedIds.includes(ann.module_id);
  if (!canWrite) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("module_announcements")
    .update({
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.content !== undefined && { content: data.content?.trim() || "" }),
    })
    .eq("id", announcementId);

  if (error) return { error: error.message };
  revalidatePath(`/teacher`);
  revalidatePath(`/modules`);
  return { success: true };
}

export async function deleteModuleAnnouncement(announcementId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Database error" };

  const { data: ann } = await supabase
    .from("module_announcements")
    .select("module_id")
    .eq("id", announcementId)
    .single();
  if (!ann) return { error: "Announcement not found" };

  const isAdmin = await requireAdmin();
  const assignedIds = await getAssignedModuleIds();
  const canWrite = isAdmin || assignedIds.includes(ann.module_id);
  if (!canWrite) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("module_announcements")
    .delete()
    .eq("id", announcementId);
  if (error) return { error: error.message };
  revalidatePath(`/teacher`);
  revalidatePath(`/modules`);
  return { success: true };
}
