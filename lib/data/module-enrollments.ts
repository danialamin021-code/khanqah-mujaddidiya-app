/**
 * Module enrollments — fetch enrolled students for a module.
 */

import { createClient } from "@/lib/supabase/server";

export interface EnrolledStudent {
  id: string;
  full_name: string | null;
  email: string | null;
}

/**
 * Get students enrolled in a module.
 * Joins module_enrollments with profiles.
 */
export async function getEnrolledStudents(
  moduleId: string
): Promise<EnrolledStudent[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: enrollments, error } = await supabase
    .from("module_enrollments")
    .select("user_id")
    .eq("module_id", moduleId)
    .eq("status", "active")
    .eq("is_archived", false);

  if (error || !enrollments?.length) return [];

  const userIds = enrollments.map((e) => e.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds);

  return (profiles ?? []).map((p) => ({
    id: (p as { id: string }).id,
    full_name: (p as { full_name?: string | null }).full_name ?? null,
    email: (p as { email?: string | null }).email ?? null,
  })) as EnrolledStudent[];
}

/**
 * Check if a user is enrolled in a module.
 */
export async function isUserEnrolled(
  userId: string,
  moduleId: string
): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("module_enrollments")
    .select("id")
    .eq("module_id", moduleId)
    .eq("user_id", userId)
    .eq("status", "active")
    .eq("is_archived", false)
    .maybeSingle();

  return !error && !!data;
}
