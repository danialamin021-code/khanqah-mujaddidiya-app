/**
 * Student dashboard — real enrollments and attendance stats.
 */

import { createClient } from "@/lib/supabase/server";

export interface StudentEnrollment {
  moduleId: string;
  moduleSlug: string;
  moduleTitle: string;
}

export interface StudentModuleStats {
  totalSessions: number;
  attendedSessions: number;
  attendancePercentage: number;
}

/**
 * Get modules the student is enrolled in.
 * Joins module_enrollments with modules.
 */
export async function getStudentEnrollments(
  studentId: string
): Promise<StudentEnrollment[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: enrollments, error } = await supabase
    .from("module_enrollments")
    .select("module_id")
    .eq("user_id", studentId)
    .eq("status", "active")
    .eq("is_archived", false);

  if (error || !enrollments?.length) return [];

  const moduleIds = enrollments.map((e) => e.module_id);
  const { data: modules } = await supabase
    .from("modules")
    .select("id, slug, title")
    .in("id", moduleIds)
    .eq("is_archived", false)
    .order("sort_order");

  return (modules ?? []).map((m) => ({
    moduleId: (m as { id: string }).id,
    moduleSlug: (m as { slug: string }).slug,
    moduleTitle: (m as { title: string }).title,
  })) as StudentEnrollment[];
}

/**
 * Get attendance stats for a student in a module.
 * - totalSessions: count of module_sessions for this module
 * - attendedSessions: count of module_attendance where status = 'present'
 * - attendancePercentage: (attended / total) * 100, rounded, or 0 if total = 0
 */
export async function getStudentModuleStats(
  studentId: string,
  moduleId: string
): Promise<StudentModuleStats> {
  const supabase = await createClient();
  if (!supabase) {
    return { totalSessions: 0, attendedSessions: 0, attendancePercentage: 0 };
  }

  const { data: sessions } = await supabase
    .from("module_sessions")
    .select("id")
    .eq("module_id", moduleId)
    .eq("is_archived", false);

  const sessionIds = (sessions ?? []).map((s) => s.id);
  const totalSessions = sessionIds.length;

  if (totalSessions === 0) {
    return { totalSessions: 0, attendedSessions: 0, attendancePercentage: 0 };
  }

  const { data: attendance } = await supabase
    .from("module_attendance")
    .select("status")
    .eq("user_id", studentId)
    .in("session_id", sessionIds);

  const attendedSessions = (attendance ?? []).filter(
    (a) => (a as { status: string }).status === "present"
  ).length;

  const attendancePercentage = Math.round(
    (attendedSessions / totalSessions) * 100
  );

  return {
    totalSessions,
    attendedSessions,
    attendancePercentage,
  };
}

export interface ModuleLiveSession {
  zoomLink: string | null;
  topic: string | null;
  date: string;
  time: string | null;
  status: string;
}

/**
 * Get live or next scheduled session for a module (for Join Session CTA).
 */
export async function getModuleLiveSession(
  moduleId: string
): Promise<ModuleLiveSession | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: live } = await supabase
    .from("module_sessions")
    .select("zoom_link, topic, date, time, status")
    .eq("module_id", moduleId)
    .eq("is_archived", false)
    .eq("status", "live")
    .limit(1)
    .maybeSingle();

  if (live) {
    return {
      zoomLink: (live as { zoom_link: string | null }).zoom_link,
      topic: (live as { topic: string | null }).topic,
      date: (live as { date: string }).date,
      time: (live as { time: string | null }).time,
      status: (live as { status: string }).status,
    };
  }

  const { data: next } = await supabase
    .from("module_sessions")
    .select("zoom_link, topic, date, time, status")
    .eq("module_id", moduleId)
    .eq("is_archived", false)
    .eq("status", "scheduled")
    .gte("date", new Date().toISOString().slice(0, 10))
    .order("date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (next) {
    return {
      zoomLink: (next as { zoom_link: string | null }).zoom_link,
      topic: (next as { topic: string | null }).topic,
      date: (next as { date: string }).date,
      time: (next as { time: string | null }).time,
      status: (next as { status: string }).status,
    };
  }

  return null;
}
