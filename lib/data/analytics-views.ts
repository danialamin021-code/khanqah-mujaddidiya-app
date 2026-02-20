/**
 * Analytics views — student_dashboard_stats, teacher_batch_stats, platform_analytics.
 * RLS applies; only fetch for authorized users.
 */

import { createClient } from "@/lib/supabase/server";

export interface StudentDashboardStats {
  user_id: string;
  total_enrollments: number;
  active_batches: number;
  overall_attendance_avg: number;
  completed_batches: number;
  failed_batches: number;
  last_activity_date: string | null;
}

export interface TeacherBatchStats {
  user_id: string;
  total_batches: number;
  avg_attendance_per_batch: number;
  total_students: number;
  students_below_50_percent: number;
  session_consistency_score: number;
}

export interface PlatformAnalytics {
  total_students: number;
  active_students: number;
  total_batches: number;
  active_batches: number;
  platform_attendance_avg: number;
  monthly_enrollment_trend: { month: string; count: number }[] | null;
  completion_rate: number;
  dropout_rate: number;
}

/** Uses RPC get_my_student_dashboard_stats() — returns only current user's row. */
export async function getStudentDashboardStats(): Promise<StudentDashboardStats | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.rpc("get_my_student_dashboard_stats");
  const rows = (data ?? []) as StudentDashboardStats[];
  return rows[0] ?? null;
}

/** Uses RPC get_my_teacher_batch_stats() — returns only current user's row. */
export async function getTeacherBatchStats(): Promise<TeacherBatchStats | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.rpc("get_my_teacher_batch_stats");
  const rows = (data ?? []) as TeacherBatchStats[];
  return rows[0] ?? null;
}

/** Uses RPC get_platform_analytics() — admin/director only. */
export async function getPlatformAnalytics(): Promise<PlatformAnalytics | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.rpc("get_platform_analytics");
  const rows = (data ?? []) as PlatformAnalytics[];
  return rows[0] ?? null;
}
