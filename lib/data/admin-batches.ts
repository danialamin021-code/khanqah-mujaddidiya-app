/**
 * Admin/Director batch analytics — academic overview, participation alerts, director stats.
 */

import { createClient } from "@/lib/supabase/server";

export interface DirectorOverview {
  totalStudents: number;
  activeBatches: number;
  overallAttendancePercent: number;
  bayatCount: number;
  newEnrollmentsCount: number;
}

/**
 * Get high-level director overview (Total students, Active batches, Attendance %, Bayat, New enrollments).
 */
export async function getDirectorOverview(): Promise<DirectorOverview> {
  const supabase = await createClient();
  if (!supabase) {
    return {
      totalStudents: 0,
      activeBatches: 0,
      overallAttendancePercent: 0,
      bayatCount: 0,
      newEnrollmentsCount: 0,
    };
  }

  const [profilesRes, batchesRes, partRes, bayatRes, enrollRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("batches").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("batch_participation").select("attendance_percentage"),
    supabase.from("bayat_requests").select("id", { count: "exact", head: true }),
    supabase
      .from("batch_enrollments")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const percentages = (partRes.data ?? []) as { attendance_percentage: number }[];
  const avgPct =
    percentages.length > 0
      ? percentages.reduce((s, p) => s + (p.attendance_percentage ?? 0), 0) / percentages.length
      : 0;

  return {
    totalStudents: profilesRes.count ?? 0,
    activeBatches: batchesRes.count ?? 0,
    overallAttendancePercent: Math.round(avgPct),
    bayatCount: bayatRes.count ?? 0,
    newEnrollmentsCount: enrollRes.count ?? 0,
  };
}

export interface AcademicOverview {
  totalBatches: number;
  activeBatches: number;
  averageAttendancePercent: number;
  totalBatchEnrollments: number;
}

export interface ParticipationAlert {
  userId: string;
  fullName: string | null;
  batchId: string;
  batchName: string;
  attendancePercentage: number;
}

/**
 * Get academic overview for admin dashboard.
 */
export async function getAcademicOverview(): Promise<AcademicOverview> {
  const supabase = await createClient();
  if (!supabase) {
    return {
      totalBatches: 0,
      activeBatches: 0,
      averageAttendancePercent: 0,
      totalBatchEnrollments: 0,
    };
  }

  const [batchesRes, activeRes, enrollRes, partRes] = await Promise.all([
    supabase.from("batches").select("id", { count: "exact", head: true }),
    supabase.from("batches").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("batch_enrollments").select("id", { count: "exact", head: true }).eq("enrollment_status", "active"),
    supabase.from("batch_participation").select("attendance_percentage"),
  ]);

  const totalBatches = batchesRes.count ?? 0;
  const activeBatches = activeRes.count ?? 0;
  const totalBatchEnrollments = enrollRes.count ?? 0;

  const percentages = (partRes.data ?? []) as { attendance_percentage: number }[];
  const avgPct =
    percentages.length > 0
      ? percentages.reduce((s, p) => s + (p.attendance_percentage ?? 0), 0) / percentages.length
      : 0;

  return {
    totalBatches,
    activeBatches,
    averageAttendancePercent: Math.round(avgPct),
    totalBatchEnrollments,
  };
}

/**
 * Get students below 50% attendance (participation alerts).
 */
export async function getParticipationAlerts(
  page = 1,
  limit = 25
): Promise<{ alerts: ParticipationAlert[]; totalCount: number }> {
  const supabase = await createClient();
  if (!supabase) return { alerts: [], totalCount: 0 };

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: lowPart } = await supabase
    .from("batch_participation")
    .select("user_id, batch_id, attendance_percentage")
    .lt("attendance_percentage", 50)
    .gt("total_sessions", 0);

  if (!lowPart?.length) return { alerts: [], totalCount: 0 };

  const batchIds = [...new Set(lowPart.map((p) => p.batch_id))];
  const userIds = [...new Set(lowPart.map((p) => p.user_id))];

  const [batchesRes, enrollRes] = await Promise.all([
    supabase.from("batches").select("id, name").in("id", batchIds),
    supabase
      .from("batch_enrollments")
      .select("user_id, batch_id, full_name")
      .in("batch_id", batchIds)
      .in("user_id", userIds),
  ]);

  const batchMap = new Map<string, string>();
  for (const b of batchesRes?.data ?? []) {
    batchMap.set((b as { id: string; name: string }).id, (b as { id: string; name: string }).name);
  }
  const enrollMap = new Map<string, string>();
  for (const e of enrollRes?.data ?? []) {
    enrollMap.set(`${(e as { user_id: string }).user_id}:${(e as { batch_id: string }).batch_id}`, (e as { full_name: string | null }).full_name ?? "—");
  }

  const alerts: ParticipationAlert[] = lowPart.map((p) => ({
    userId: p.user_id,
    fullName: enrollMap.get(`${p.user_id}:${p.batch_id}`) ?? null,
    batchId: p.batch_id,
    batchName: batchMap.get(p.batch_id) ?? "—",
    attendancePercentage: p.attendance_percentage ?? 0,
  }));

  const totalCount = alerts.length;
  const paginated = alerts.slice(from, to + 1);

  return { alerts: paginated, totalCount };
}
