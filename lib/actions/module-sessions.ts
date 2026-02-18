"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, getAssignedModuleIds, getCurrentRole } from "@/lib/auth";
import { logActivity } from "@/lib/utils/activity-logger";

/**
 * Create or update a module session. Teachers can only for assigned modules.
 */
export async function createModuleSession(
  moduleId: string,
  data: { date: string; time?: string; topic?: string; zoom_link?: string; status?: string }
) {
  const supabase = await createClient();
  if (!supabase) return { error: "Database error" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const isAdmin = await requireAdmin();
  const assignedIds = await getAssignedModuleIds();
  const canWrite = isAdmin || assignedIds.includes(moduleId);
  if (!canWrite) return { error: "Unauthorized" };

  // Invariant: session must belong to existing module
  const { data: mod } = await supabase
    .from("modules")
    .select("id")
    .eq("id", moduleId)
    .eq("is_archived", false)
    .single();
  if (!mod) return { error: "Module not found or archived" };

  const { data: inserted, error } = await supabase
    .from("module_sessions")
    .insert({
      module_id: moduleId,
      date: data.date,
      time: data.time || null,
      topic: data.topic || null,
      zoom_link: data.zoom_link || null,
      status: data.status || "scheduled",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  const actorRole = (await getCurrentRole()) ?? "teacher";
  await logActivity({
    actorId: user.id,
    actorRole,
    actionType: "create",
    entityType: "module_session",
    entityId: inserted?.id ?? undefined,
    description: `Created session for module`,
    metadata: { moduleId, date: data.date },
  });
  revalidatePath(`/teacher`);
  revalidatePath(`/modules`);
  return { success: true };
}

export async function updateModuleSession(
  sessionId: string,
  data: { date?: string; time?: string; topic?: string; zoom_link?: string; status?: string }
) {
  const supabase = await createClient();
  if (!supabase) return { error: "Database error" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const isAdmin = await requireAdmin();
  const { data: session } = await supabase
    .from("module_sessions")
    .select("module_id")
    .eq("id", sessionId)
    .eq("is_archived", false)
    .single();
  if (!session) return { error: "Session not found" };

  const assignedIds = await getAssignedModuleIds();
  const canWrite = isAdmin || assignedIds.includes(session.module_id);
  if (!canWrite) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("module_sessions")
    .update({
      ...(data.date && { date: data.date }),
      ...(data.time !== undefined && { time: data.time }),
      ...(data.topic !== undefined && { topic: data.topic }),
      ...(data.zoom_link !== undefined && { zoom_link: data.zoom_link }),
      ...(data.status && { status: data.status }),
    })
    .eq("id", sessionId);

  if (error) return { error: error.message };
  revalidatePath(`/teacher`);
  revalidatePath(`/modules`);
  return { success: true };
}

export async function deleteModuleSession(sessionId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Database error" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const isAdmin = await requireAdmin();
  const { data: session } = await supabase
    .from("module_sessions")
    .select("module_id, date")
    .eq("id", sessionId)
    .eq("is_archived", false)
    .single();
  if (!session) return { error: "Session not found" };

  const assignedIds = await getAssignedModuleIds();
  const canWrite = isAdmin || assignedIds.includes(session.module_id);
  if (!canWrite) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("module_sessions")
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) return { error: error.message };
  const actorRole = (await getCurrentRole()) ?? "teacher";
  await logActivity({
    actorId: user.id,
    actorRole,
    actionType: "archive",
    entityType: "module_session",
    entityId: sessionId,
    description: `Archived session`,
    metadata: { moduleId: session.module_id, date: session.date },
  });
  revalidatePath(`/teacher`);
  revalidatePath(`/modules`);
  return { success: true };
}
