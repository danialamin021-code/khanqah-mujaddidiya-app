/**
 * Module overview stats for teacher view.
 */

import { createClient } from "@/lib/supabase/server";

export interface ModuleOverviewStats {
  enrollments: number;
  sessions: number;
  resources: number;
  announcements: number;
}

export async function getModuleOverviewStats(
  moduleId: string
): Promise<ModuleOverviewStats> {
  const supabase = await createClient();
  if (!supabase) {
    return { enrollments: 0, sessions: 0, resources: 0, announcements: 0 };
  }

  const [enrollmentsRes, sessionsRes, resourcesRes, announcementsRes] = await Promise.all([
    supabase
      .from("module_enrollments")
      .select("id")
      .eq("module_id", moduleId)
      .eq("status", "active")
      .eq("is_archived", false),
    supabase
      .from("module_sessions")
      .select("id")
      .eq("module_id", moduleId)
      .eq("is_archived", false),
    supabase
      .from("module_resources")
      .select("id")
      .eq("module_id", moduleId),
    supabase
      .from("module_announcements")
      .select("id")
      .eq("module_id", moduleId),
  ]);

  return {
    enrollments: enrollmentsRes.data?.length ?? 0,
    sessions: sessionsRes.data?.length ?? 0,
    resources: resourcesRes.data?.length ?? 0,
    announcements: announcementsRes.data?.length ?? 0,
  };
}
