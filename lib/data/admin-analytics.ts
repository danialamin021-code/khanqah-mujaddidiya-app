/**
 * Admin analytics — platform stats, attendance health, module performance.
 * Only call from admin/director context.
 */

import { createClient } from "@/lib/supabase/server";

export interface PlatformStats {
  totalStudents: number;
  totalTeachers: number;
  totalModules: number;
  totalSessionsConducted: number;
}

export interface AttendanceHealth {
  overallAttendancePercentage: number;
  studentsBelow60Percent: number;
  modulesBelow70Percent: number;
}

export interface ModulePerformance {
  moduleId: string;
  moduleName: string;
  teacherName: string;
  totalStudents: number;
  totalSessions: number;
  averageAttendance: number;
}

export interface RiskAlert {
  type: "student_low_attendance" | "module_no_sessions" | "teacher_no_sessions";
  message: string;
  detail?: string;
}

export interface SystemHealth {
  totalUsers: number;
  totalModules: number;
  totalEnrollments: number;
  totalLogs: number;
  lastActivityTimestamp: string | null;
  directorCount: number;
}

export interface ActivityLogRow {
  id: string;
  actor_id: string | null;
  actor_role: string | null;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Get activity logs for admin. Only admin/director can read (RLS).
 */
export async function getActivityLogs(limit = 100): Promise<ActivityLogRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("system_activity_logs")
    .select("id, actor_id, actor_role, action_type, entity_type, entity_id, description, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as ActivityLogRow[];
}

/**
 * Get system health metrics for /admin/system-health.
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  const supabase = await createClient();
  if (!supabase) {
    return {
      totalUsers: 0,
      totalModules: 0,
      totalEnrollments: 0,
      totalLogs: 0,
      lastActivityTimestamp: null,
      directorCount: 0,
    };
  }

  const [usersRes, modulesRes, enrollmentsRes, logsRes, directorsRes, logsCountRes] = await Promise.all([
    supabase.from("profiles").select("id"),
    supabase.from("modules").select("id").eq("is_archived", false),
    supabase.from("module_enrollments").select("id").eq("is_archived", false),
    supabase.from("system_activity_logs").select("created_at").order("created_at", { ascending: false }).limit(1),
    supabase.from("profiles").select("id").contains("roles", ["director"]),
    supabase.from("system_activity_logs").select("id", { count: "exact", head: true }),
  ]);

  const lastLog = (logsRes.data ?? [])[0] as { created_at?: string } | undefined;
  return {
    totalUsers: usersRes.data?.length ?? 0,
    totalModules: modulesRes.data?.length ?? 0,
    totalEnrollments: enrollmentsRes.data?.length ?? 0,
    totalLogs: logsCountRes.count ?? 0,
    lastActivityTimestamp: lastLog?.created_at ?? null,
    directorCount: directorsRes.data?.length ?? 0,
  };
}

/**
 * Get platform-wide stats.
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  const supabase = await createClient();
  if (!supabase) {
    return { totalStudents: 0, totalTeachers: 0, totalModules: 0, totalSessionsConducted: 0 };
  }

  const [studentsRes, teachersRes, modulesRes, sessionsRes] = await Promise.all([
    supabase.from("profiles").select("id").contains("roles", ["student"]),
    supabase.from("profiles").select("id").contains("roles", ["teacher"]),
    supabase.from("modules").select("id").eq("is_archived", false),
    supabase.from("module_sessions").select("id").eq("is_archived", false),
  ]);

  return {
    totalStudents: studentsRes.data?.length ?? 0,
    totalTeachers: teachersRes.data?.length ?? 0,
    totalModules: modulesRes.data?.length ?? 0,
    totalSessionsConducted: sessionsRes.data?.length ?? 0,
  };
}

/**
 * Get platform attendance health.
 * overallAttendancePercentage = present_records / total_records * 100
 */
export async function getPlatformAttendanceHealth(): Promise<AttendanceHealth> {
  const supabase = await createClient();
  if (!supabase) {
    return { overallAttendancePercentage: 0, studentsBelow60Percent: 0, modulesBelow70Percent: 0 };
  }

  const { data: allAttendance } = await supabase
    .from("module_attendance")
    .select("id, status");

  const totalRecords = allAttendance?.length ?? 0;
  const presentRecords = (allAttendance ?? []).filter((a) => (a as { status: string }).status === "present").length;
  const overallAttendancePercentage =
    totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

  const { data: enrollments } = await supabase
    .from("module_enrollments")
    .select("user_id, module_id")
    .eq("status", "active")
    .eq("is_archived", false);

  const { data: sessions } = await supabase.from("module_sessions").select("id, module_id, date").eq("is_archived", false);
  const { data: attendance } = await supabase
    .from("module_attendance")
    .select("session_id, user_id, status");

  const sessionIdsByModule = new Map<string, string[]>();
  (sessions ?? []).forEach((s) => {
    const mid = (s as { module_id: string }).module_id;
    const list = sessionIdsByModule.get(mid) ?? [];
    list.push((s as { id: string }).id);
    sessionIdsByModule.set(mid, list);
  });

  const presentByUserModule = new Map<string, number>();
  const totalByUserModule = new Map<string, number>();

  (enrollments ?? []).forEach((e) => {
    const userId = (e as { user_id: string }).user_id;
    const moduleId = (e as { module_id: string }).module_id;
    const sessionIds = sessionIdsByModule.get(moduleId) ?? [];
    const total = sessionIds.length;
    const key = `${userId}:${moduleId}`;
    totalByUserModule.set(key, total);

    const present = (attendance ?? []).filter(
      (a) =>
        (a as { user_id: string }).user_id === userId &&
        sessionIds.includes((a as { session_id: string }).session_id) &&
        (a as { status: string }).status === "present"
    ).length;
    presentByUserModule.set(key, present);
  });

  const userPercents = new Map<string, number[]>();
  enrollments?.forEach((e) => {
    const userId = (e as { user_id: string }).user_id;
    const moduleId = (e as { module_id: string }).module_id;
    const key = `${userId}:${moduleId}`;
    const total = totalByUserModule.get(key) ?? 0;
    const present = presentByUserModule.get(key) ?? 0;
    const pct = total > 0 ? (present / total) * 100 : 0;
    const list = userPercents.get(userId) ?? [];
    list.push(pct);
    userPercents.set(userId, list);
  });

  let studentsBelow60Percent = 0;
  userPercents.forEach((percents) => {
    const avg = percents.length > 0 ? percents.reduce((a, b) => a + b, 0) / percents.length : 0;
    if (avg < 60) studentsBelow60Percent++;
  });

  const moduleIds = [...new Set((enrollments ?? []).map((e) => (e as { module_id: string }).module_id))];
  let modulesBelow70Percent = 0;
  moduleIds.forEach((moduleId) => {
    const percents: number[] = [];
    (enrollments ?? []).forEach((e) => {
      if ((e as { module_id: string }).module_id !== moduleId) return;
      const userId = (e as { user_id: string }).user_id;
      const key = `${userId}:${moduleId}`;
      const total = totalByUserModule.get(key) ?? 0;
      const present = presentByUserModule.get(key) ?? 0;
      if (total > 0) percents.push((present / total) * 100);
    });
    const avg = percents.length > 0 ? percents.reduce((a, b) => a + b, 0) / percents.length : 0;
    if (avg < 70) modulesBelow70Percent++;
  });

  return {
    overallAttendancePercentage,
    studentsBelow60Percent,
    modulesBelow70Percent,
  };
}

/**
 * Get per-module performance.
 */
export async function getModulePerformance(): Promise<ModulePerformance[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title")
    .eq("is_archived", false)
    .order("sort_order");

  if (!modules?.length) return [];

  const { data: sessions } = await supabase.from("module_sessions").select("id, module_id").eq("is_archived", false);
  const { data: enrollments } = await supabase
    .from("module_enrollments")
    .select("user_id, module_id")
    .eq("status", "active")
    .eq("is_archived", false);
  const { data: attendance } = await supabase
    .from("module_attendance")
    .select("session_id, user_id, status");
  const { data: teachers } = await supabase
    .from("module_teachers")
    .select("module_id, user_id");

  const sessionIdsByModule = new Map<string, string[]>();
  (sessions ?? []).forEach((s) => {
    const mid = (s as { module_id: string }).module_id;
    const list = sessionIdsByModule.get(mid) ?? [];
    list.push((s as { id: string }).id);
    sessionIdsByModule.set(mid, list);
  });

  const teacherIdsByModule = new Map<string, string[]>();
  (teachers ?? []).forEach((t) => {
    const mid = (t as { module_id: string }).module_id;
    const list = teacherIdsByModule.get(mid) ?? [];
    list.push((t as { user_id: string }).user_id);
    teacherIdsByModule.set(mid, list);
  });

  const teacherProfiles = teacherIdsByModule.size > 0
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", [...new Set([...teacherIdsByModule.values()].flat())])
    : { data: [] };

  const teacherNameByModule = new Map<string, string>();
  modules.forEach((m) => {
    const ids = teacherIdsByModule.get((m as { id: string }).id) ?? [];
    const names = ids.map((id) => {
      const p = (teacherProfiles.data ?? []).find((x) => (x as { id: string }).id === id);
      return (p as { full_name?: string; email?: string })?.full_name ?? (p as { email?: string })?.email ?? "—";
    });
    teacherNameByModule.set((m as { id: string }).id, names.join(", ") || "—");
  });

  const presentByUserModule = new Map<string, number>();
  const totalByUserModule = new Map<string, number>();
  (enrollments ?? []).forEach((e) => {
    const userId = (e as { user_id: string }).user_id;
    const moduleId = (e as { module_id: string }).module_id;
    const sessionIds = sessionIdsByModule.get(moduleId) ?? [];
    const total = sessionIds.length;
    const key = `${userId}:${moduleId}`;
    totalByUserModule.set(key, total);
    const present = (attendance ?? []).filter(
      (a) =>
        (a as { user_id: string }).user_id === userId &&
        sessionIds.includes((a as { session_id: string }).session_id) &&
        (a as { status: string }).status === "present"
    ).length;
    presentByUserModule.set(key, present);
  });

  return modules.map((m) => {
    const moduleId = (m as { id: string }).id;
    const totalSessions = sessionIdsByModule.get(moduleId)?.length ?? 0;
    const enrolled = (enrollments ?? []).filter((e) => (e as { module_id: string }).module_id === moduleId);
    const totalStudents = enrolled.length;

    const percents: number[] = [];
    enrolled.forEach((e) => {
      const userId = (e as { user_id: string }).user_id;
      const key = `${userId}:${moduleId}`;
      const total = totalByUserModule.get(key) ?? 0;
      const present = presentByUserModule.get(key) ?? 0;
      if (total > 0) percents.push((present / total) * 100);
    });
    const averageAttendance =
      percents.length > 0 ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length) : 0;

    return {
      moduleId,
      moduleName: (m as { title: string }).title,
      teacherName: teacherNameByModule.get(moduleId) ?? "—",
      totalStudents,
      totalSessions,
      averageAttendance,
    };
  });
}

/**
 * Get risk alerts for admin dashboard.
 */
export async function getRiskAlerts(): Promise<RiskAlert[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const alerts: RiskAlert[] = [];
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const cutoff = fourteenDaysAgo.toISOString().slice(0, 10);

  const { data: enrollments } = await supabase
    .from("module_enrollments")
    .select("user_id, module_id")
    .eq("status", "active")
    .eq("is_archived", false);
  const { data: sessions } = await supabase.from("module_sessions").select("id, module_id, date").eq("is_archived", false);
  const { data: attendance } = await supabase
    .from("module_attendance")
    .select("session_id, user_id, status");
  const { data: teachers } = await supabase.from("module_teachers").select("module_id, user_id");
  const { data: profiles } = await supabase.from("profiles").select("id, full_name, email");

  const sessionIdsByModule = new Map<string, string[]>();
  const lastSessionDateByModule = new Map<string, string>();
  (sessions ?? []).forEach((s) => {
    const mid = (s as { module_id: string }).module_id;
    const list = sessionIdsByModule.get(mid) ?? [];
    list.push((s as { id: string }).id);
    sessionIdsByModule.set(mid, list);
    const d = (s as { date: string }).date;
    const current = lastSessionDateByModule.get(mid);
    if (!current || d > current) lastSessionDateByModule.set(mid, d);
  });

  const presentByUserModule = new Map<string, number>();
  const totalByUserModule = new Map<string, number>();
  (enrollments ?? []).forEach((e) => {
    const userId = (e as { user_id: string }).user_id;
    const moduleId = (e as { module_id: string }).module_id;
    const sessionIds = sessionIdsByModule.get(moduleId) ?? [];
    const total = sessionIds.length;
    const key = `${userId}:${moduleId}`;
    totalByUserModule.set(key, total);
    const present = (attendance ?? []).filter(
      (a) =>
        (a as { user_id: string }).user_id === userId &&
        sessionIds.includes((a as { session_id: string }).session_id) &&
        (a as { status: string }).status === "present"
    ).length;
    presentByUserModule.set(key, present);
  });

  const userPercents = new Map<string, number[]>();
  (enrollments ?? []).forEach((e) => {
    const userId = (e as { user_id: string }).user_id;
    const moduleId = (e as { module_id: string }).module_id;
    const key = `${userId}:${moduleId}`;
    const total = totalByUserModule.get(key) ?? 0;
    const present = presentByUserModule.get(key) ?? 0;
    const pct = total > 0 ? (present / total) * 100 : 0;
    const list = userPercents.get(userId) ?? [];
    list.push(pct);
    userPercents.set(userId, list);
  });

  userPercents.forEach((percents, userId) => {
    const avg = percents.length > 0 ? percents.reduce((a, b) => a + b, 0) / percents.length : 0;
    if (avg < 50) {
      const p = (profiles ?? []).find((x) => (x as { id: string }).id === userId);
      const name = (p as { full_name?: string; email?: string })?.full_name ?? (p as { email?: string })?.email ?? "Unknown";
      alerts.push({
        type: "student_low_attendance",
        message: `Student attendance below 50%`,
        detail: `${name} (${Math.round(avg)}%)`,
      });
    }
  });

  const { data: allModules } = await supabase.from("modules").select("id, title").eq("is_archived", false);
  const moduleTitles = new Map((allModules ?? []).map((m) => [(m as { id: string }).id, (m as { title: string }).title]));

  for (const [moduleId, lastDate] of lastSessionDateByModule) {
    if (lastDate < cutoff) {
      alerts.push({
        type: "module_no_sessions",
        message: `No sessions in last 14 days`,
        detail: moduleTitles.get(moduleId) ?? moduleId,
      });
    }
  }

  const teacherModuleIds = new Set((teachers ?? []).map((t) => (t as { module_id: string }).module_id));
  for (const moduleId of teacherModuleIds) {
    const sessionIds = sessionIdsByModule.get(moduleId) ?? [];
    if (sessionIds.length === 0) {
      alerts.push({
        type: "teacher_no_sessions",
        message: `Teacher assigned but no sessions conducted`,
        detail: moduleTitles.get(moduleId) ?? moduleId,
      });
    }
  }

  return alerts;
}
