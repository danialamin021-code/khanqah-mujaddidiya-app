"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, getAssignedModuleIds, getCurrentRole } from "@/lib/auth";
import { isUserEnrolled } from "@/lib/data/module-enrollments";
import { logActivity } from "@/lib/utils/activity-logger";

export async function markAttendance(
  sessionId: string,
  userId: string,
  status: "present" | "absent"
) {
  const supabase = await createClient();
  if (!supabase) return { error: "Database error" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: session } = await supabase
    .from("module_sessions")
    .select("module_id, date")
    .eq("id", sessionId)
    .eq("is_archived", false)
    .single();
  if (!session) return { error: "Session not found" };

  const isAdmin = await requireAdmin();
  const assignedIds = await getAssignedModuleIds();
  const canWrite = isAdmin || assignedIds.includes(session.module_id);
  if (!canWrite) return { error: "Unauthorized" };

  const enrolled = await isUserEnrolled(userId, session.module_id);
  if (!enrolled) return { error: "Student is not enrolled in this module" };

  const { error } = await supabase
    .from("module_attendance")
    .upsert(
      { session_id: sessionId, user_id: userId, status },
      { onConflict: "session_id,user_id" }
    );

  if (error) return { error: error.message };
  const actorRole = (await getCurrentRole()) ?? "teacher";
  await logActivity({
    actorId: user.id,
    actorRole,
    actionType: "mark_attendance",
    entityType: "module_attendance",
    entityId: sessionId,
    description: `Marked ${status} for student`,
    metadata: { sessionId, userId, status, sessionDate: session.date },
  });
  revalidatePath(`/teacher`);
  return { success: true };
}
