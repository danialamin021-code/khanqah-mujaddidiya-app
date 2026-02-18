/**
 * Teacher progress — teaching stats for assigned modules.
 */

import { createClient } from "@/lib/supabase/server";

export interface TeacherModuleProgress {
  moduleId: string;
  moduleSlug: string;
  moduleTitle: string;
  sessionsCreated: number;
  enrollments: number;
  attendanceMarked: number;
}

export interface TeacherProgress {
  totalModules: number;
  totalSessionsCreated: number;
  totalAttendanceMarked: number;
  modules: TeacherModuleProgress[];
}

/**
 * Get teaching progress for a teacher (assigned modules, sessions, attendance).
 */
export async function getTeacherProgress(teacherId: string): Promise<TeacherProgress> {
  const supabase = await createClient();
  if (!supabase) {
    return { totalModules: 0, totalSessionsCreated: 0, totalAttendanceMarked: 0, modules: [] };
  }

  const { data: assignments } = await supabase
    .from("module_teachers")
    .select("module_id")
    .eq("user_id", teacherId);

  if (!assignments?.length) {
    return { totalModules: 0, totalSessionsCreated: 0, totalAttendanceMarked: 0, modules: [] };
  }

  const moduleIds = assignments.map((a) => a.module_id);

  const { data: modules } = await supabase
    .from("modules")
    .select("id, slug, title")
    .in("id", moduleIds)
    .eq("is_archived", false)
    .order("sort_order");

  if (!modules?.length) {
    return { totalModules: 0, totalSessionsCreated: 0, totalAttendanceMarked: 0, modules: [] };
  }

  const { data: sessions } = await supabase
    .from("module_sessions")
    .select("id, module_id")
    .in("module_id", moduleIds)
    .eq("is_archived", false);

  const { data: enrollments } = await supabase
    .from("module_enrollments")
    .select("module_id")
    .in("module_id", moduleIds)
    .eq("status", "active")
    .eq("is_archived", false);

  const sessionIds = (sessions ?? []).map((s) => (s as { id: string }).id);
  const { data: attendance } =
    sessionIds.length > 0
      ? await supabase
          .from("module_attendance")
          .select("session_id")
          .in("session_id", sessionIds)
      : { data: [] };

  const sessionsByModule = new Map<string, number>();
  const attendanceByModule = new Map<string, number>();
  (sessions ?? []).forEach((s) => {
    const mid = (s as { module_id: string }).module_id;
    sessionsByModule.set(mid, (sessionsByModule.get(mid) ?? 0) + 1);
  });

  const sessionIdToModule = new Map<string, string>();
  (sessions ?? []).forEach((s) => {
    sessionIdToModule.set((s as { id: string }).id, (s as { module_id: string }).module_id);
  });
  (attendance ?? []).forEach((a) => {
    const sid = (a as { session_id: string }).session_id;
    const mid = sessionIdToModule.get(sid);
    if (mid) attendanceByModule.set(mid, (attendanceByModule.get(mid) ?? 0) + 1);
  });

  const enrollmentsByModule = new Map<string, number>();
  (enrollments ?? []).forEach((e) => {
    const mid = (e as { module_id: string }).module_id;
    enrollmentsByModule.set(mid, (enrollmentsByModule.get(mid) ?? 0) + 1);
  });

  const moduleProgress: TeacherModuleProgress[] = modules.map((m) => {
    const mid = (m as { id: string }).id;
    return {
      moduleId: mid,
      moduleSlug: (m as { slug: string }).slug,
      moduleTitle: (m as { title: string }).title,
      sessionsCreated: sessionsByModule.get(mid) ?? 0,
      enrollments: enrollmentsByModule.get(mid) ?? 0,
      attendanceMarked: attendanceByModule.get(mid) ?? 0,
    };
  });

  return {
    totalModules: moduleProgress.length,
    totalSessionsCreated: (sessions ?? []).length,
    totalAttendanceMarked: (attendance ?? []).length,
    modules: moduleProgress,
  };
}
