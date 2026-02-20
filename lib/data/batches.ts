/**
 * Batch data access — batches, sessions, enrollments, attendance, participation.
 */

import { createClient } from "@/lib/supabase/server";

export interface BatchRow {
  id: string;
  module_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  teacher_id: string | null;
  whatsapp_group_link: string | null;
  price: number;
  currency: string;
  is_paid: boolean;
  is_active: boolean;
  created_at: string;
}

export interface BatchSessionRow {
  id: string;
  batch_id: string;
  title: string;
  session_date: string;
  zoom_link: string | null;
  topic: string | null;
  created_at: string;
}

export interface BatchEnrollmentRow {
  id: string;
  user_id: string;
  batch_id: string;
  full_name: string | null;
  whatsapp: string | null;
  country: string | null;
  city: string | null;
  joined_whatsapp: boolean;
  enrollment_status: string;
  completion_status?: "in_progress" | "completed" | "failed";
  created_at: string;
}

export interface BatchParticipationRow {
  id: string;
  batch_id: string;
  user_id: string;
  total_sessions: number;
  sessions_attended: number;
  attendance_percentage: number;
  last_attended_at: string | null;
  engagement_score: number;
  updated_at: string;
}

const BATCHES_PAGE_SIZE = 50;
const SESSIONS_PAGE_SIZE = 25;

/**
 * Get active batches for a module (students see these for browsing).
 */
export async function getActiveBatchesForModule(moduleId: string): Promise<BatchRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("batches")
    .select("id, module_id, name, description, start_date, end_date, teacher_id, whatsapp_group_link, price, currency, is_paid, is_active, created_at")
    .eq("module_id", moduleId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (data ?? []) as BatchRow[];
}

/**
 * Get batches assigned to a teacher.
 */
export async function getBatchesForTeacher(teacherId: string): Promise<BatchRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("batches")
    .select("id, module_id, name, description, start_date, end_date, teacher_id, whatsapp_group_link, price, currency, is_paid, is_active, created_at")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  return (data ?? []) as BatchRow[];
}

/**
 * Get all active batches (admin/director).
 */
export async function getAllActiveBatches(page = 1): Promise<{ batches: BatchRow[]; totalCount: number }> {
  const supabase = await createClient();
  if (!supabase) return { batches: [], totalCount: 0 };

  const from = (page - 1) * BATCHES_PAGE_SIZE;
  const to = from + BATCHES_PAGE_SIZE - 1;

  const [batchesRes, countRes] = await Promise.all([
    supabase
      .from("batches")
      .select("id, module_id, name, description, start_date, end_date, teacher_id, whatsapp_group_link, price, currency, is_paid, is_active, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase.from("batches").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  return {
    batches: (batchesRes.data ?? []) as BatchRow[],
    totalCount: countRes.count ?? 0,
  };
}

/**
 * Get a single batch by ID.
 */
export async function getBatchById(batchId: string): Promise<BatchRow | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("batches")
    .select("id, module_id, name, description, start_date, end_date, teacher_id, whatsapp_group_link, price, currency, is_paid, is_active, created_at")
    .eq("id", batchId)
    .single();

  return data as BatchRow | null;
}

/**
 * Get sessions for a batch (paginated).
 */
export async function getBatchSessions(
  batchId: string,
  page = 1
): Promise<{ sessions: BatchSessionRow[]; totalCount: number }> {
  const supabase = await createClient();
  if (!supabase) return { sessions: [], totalCount: 0 };

  const from = (page - 1) * SESSIONS_PAGE_SIZE;
  const to = from + SESSIONS_PAGE_SIZE - 1;

  const [sessionsRes, countRes] = await Promise.all([
    supabase
      .from("batch_sessions")
      .select("id, batch_id, title, session_date, zoom_link, topic, created_at")
      .eq("batch_id", batchId)
      .order("session_date", { ascending: false })
      .range(from, to),
    supabase.from("batch_sessions").select("id", { count: "exact", head: true }).eq("batch_id", batchId),
  ]);

  return {
    sessions: (sessionsRes.data ?? []) as BatchSessionRow[],
    totalCount: countRes.count ?? 0,
  };
}

/**
 * Get enrollments for a batch (teacher/admin).
 */
export async function getBatchEnrollments(
  batchId: string,
  page = 1
): Promise<{ enrollments: BatchEnrollmentRow[]; totalCount: number }> {
  const supabase = await createClient();
  if (!supabase) return { enrollments: [], totalCount: 0 };

  const from = (page - 1) * BATCHES_PAGE_SIZE;
  const to = from + BATCHES_PAGE_SIZE - 1;

  const [enrollmentsRes, countRes] = await Promise.all([
    supabase
      .from("batch_enrollments")
      .select("id, user_id, batch_id, full_name, whatsapp, country, city, joined_whatsapp, enrollment_status, created_at")
      .eq("batch_id", batchId)
      .eq("enrollment_status", "active")
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase
      .from("batch_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("batch_id", batchId)
      .eq("enrollment_status", "active"),
  ]);

  return {
    enrollments: (enrollmentsRes.data ?? []) as BatchEnrollmentRow[],
    totalCount: countRes.count ?? 0,
  };
}

/**
 * Get user's enrollment in a batch.
 */
export async function getUserBatchEnrollment(
  batchId: string,
  userId: string
): Promise<BatchEnrollmentRow | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("batch_enrollments")
    .select("id, user_id, batch_id, full_name, whatsapp, country, city, joined_whatsapp, enrollment_status, created_at")
    .eq("batch_id", batchId)
    .eq("user_id", userId)
    .maybeSingle();

  return data as BatchEnrollmentRow | null;
}

/**
 * Check if user is enrolled in batch.
 */
export async function isUserEnrolledInBatch(batchId: string, userId: string): Promise<boolean> {
  const enrollment = await getUserBatchEnrollment(batchId, userId);
  return enrollment !== null && enrollment.enrollment_status === "active";
}

/**
 * Get participation for a user in a batch.
 */
export async function getBatchParticipation(
  batchId: string,
  userId: string
): Promise<BatchParticipationRow | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("batch_participation")
    .select("id, batch_id, user_id, total_sessions, sessions_attended, attendance_percentage, last_attended_at, engagement_score, updated_at")
    .eq("batch_id", batchId)
    .eq("user_id", userId)
    .maybeSingle();

  return data as BatchParticipationRow | null;
}

/**
 * Get attendance for a batch session.
 */
export async function getBatchSessionAttendance(batchSessionId: string) {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("batch_attendance")
    .select("id, user_id, status, marked_by, created_at")
    .eq("batch_session_id", batchSessionId);

  return data ?? [];
}

/**
 * Get a student's attendance history for a batch (paginated).
 */
export async function getStudentBatchAttendance(
  batchId: string,
  userId: string,
  page = 1
): Promise<{
  rows: { session_title: string; session_date: string; status: string }[];
  totalCount: number;
}> {
  const supabase = await createClient();
  if (!supabase) return { rows: [], totalCount: 0 };

  const from = (page - 1) * SESSIONS_PAGE_SIZE;
  const to = from + SESSIONS_PAGE_SIZE - 1;

  const [sessionsRes, countRes] = await Promise.all([
    supabase
      .from("batch_sessions")
      .select("id, title, session_date")
      .eq("batch_id", batchId)
      .order("session_date", { ascending: false })
      .range(from, to),
    supabase
      .from("batch_sessions")
      .select("id", { count: "exact", head: true })
      .eq("batch_id", batchId),
  ]);

  const sessions = (sessionsRes.data ?? []) as { id: string; title: string; session_date: string }[];
  const totalCount = countRes.count ?? 0;

  if (sessions.length === 0) return { rows: [], totalCount };

  const sessionIds = sessions.map((s) => s.id);
  const { data: attendance } = await supabase
    .from("batch_attendance")
    .select("batch_session_id, status")
    .eq("user_id", userId)
    .in("batch_session_id", sessionIds);

  const bySession = new Map<string, string>();
  for (const a of attendance ?? []) {
    bySession.set(a.batch_session_id, a.status);
  }

  const rows = sessions.map((s) => ({
    session_title: s.title,
    session_date: s.session_date,
    status: bySession.get(s.id) ?? "absent",
  }));

  return { rows, totalCount };
}

/**
 * Get batch stats for teacher dashboard (students count, avg attendance, upcoming sessions).
 */
export async function getBatchStatsForTeacher(teacherId: string): Promise<
  { id: string; name: string; moduleName: string; studentsCount: number; avgAttendance: number; upcomingSessions: number }[]
> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: batches } = await supabase
    .from("batches")
    .select("id, name, module_id")
    .eq("teacher_id", teacherId)
    .eq("is_active", true);

  if (!batches?.length) return [];

  const today = new Date().toISOString().slice(0, 10);
  const result: { id: string; name: string; moduleName: string; studentsCount: number; avgAttendance: number; upcomingSessions: number }[] = [];

  for (const b of batches) {
    const [modRes, enrollRes, partRes, sessRes] = await Promise.all([
      supabase.from("modules").select("title").eq("id", b.module_id).single(),
      supabase.from("batch_enrollments").select("id", { count: "exact", head: true }).eq("batch_id", b.id).eq("enrollment_status", "active"),
      supabase.from("batch_participation").select("attendance_percentage").eq("batch_id", b.id),
      supabase.from("batch_sessions").select("id").gte("session_date", today).eq("batch_id", b.id),
    ]);

    const avgPct = (partRes.data ?? []).length > 0
      ? (partRes.data as { attendance_percentage: number }[]).reduce((s, p) => s + p.attendance_percentage, 0) / (partRes.data?.length ?? 1)
      : 0;

    result.push({
      id: b.id,
      name: b.name,
      moduleName: (modRes.data as { title?: string } | null)?.title ?? "Module",
      studentsCount: enrollRes.count ?? 0,
      avgAttendance: Math.round(avgPct),
      upcomingSessions: sessRes.data?.length ?? 0,
    });
  }

  return result;
}

/**
 * Get enrollments with participation for a batch (teacher/admin).
 */
export async function getBatchEnrollmentsWithParticipation(
  batchId: string,
  page = 1
): Promise<{
  rows: { enrollment: BatchEnrollmentRow; participation: BatchParticipationRow | null }[];
  totalCount: number;
}> {
  const { enrollments, totalCount } = await getBatchEnrollments(batchId, page);
  const supabase = await createClient();
  if (!supabase) return { rows: [], totalCount: 0 };

  const participations: { [userId: string]: BatchParticipationRow | null } = {};
  for (const e of enrollments) {
    const p = await getBatchParticipation(batchId, e.user_id);
    participations[e.user_id] = p;
  }

  return {
    rows: enrollments.map((e) => ({ enrollment: e, participation: participations[e.user_id] ?? null })),
    totalCount,
  };
}
