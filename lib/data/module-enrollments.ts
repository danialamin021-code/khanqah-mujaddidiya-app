/**
 * Module enrollments — fetch enrolled students for a module.
 */

import { createClient } from "@/lib/supabase/server";

export interface EnrolledStudent {
  id: string;
  full_name: string | null;
  email: string | null;
}

const STUDENTS_PAGE_SIZE = 50;

/**
 * Get students enrolled in a module with pagination.
 * Joins module_enrollments with profiles.
 */
export async function getEnrolledStudents(
  moduleId: string,
  page = 1,
  limit = STUDENTS_PAGE_SIZE
): Promise<{ students: EnrolledStudent[]; totalCount: number }> {
  const supabase = await createClient();
  if (!supabase) return { students: [], totalCount: 0 };

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const [enrollmentsRes, countRes] = await Promise.all([
    supabase
      .from("module_enrollments")
      .select("user_id")
      .eq("module_id", moduleId)
      .eq("status", "active")
      .eq("is_archived", false)
      .order("enrolled_at", { ascending: false })
      .range(from, to),
    supabase
      .from("module_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("module_id", moduleId)
      .eq("status", "active")
      .eq("is_archived", false),
  ]);

  const enrollments = enrollmentsRes.data ?? [];
  const totalCount = countRes.count ?? 0;

  if (enrollments.length === 0) return { students: [], totalCount };

  const userIds = enrollments.map((e) => e.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds);

  const students = (profiles ?? []).map((p) => ({
    id: (p as { id: string }).id,
    full_name: (p as { full_name?: string | null }).full_name ?? null,
    email: (p as { email?: string | null }).email ?? null,
  })) as EnrolledStudent[];

  return { students, totalCount };
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
