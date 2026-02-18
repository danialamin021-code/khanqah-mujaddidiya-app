import { getModuleBySlug } from "@/lib/data/modules";
import { getEnrolledStudents } from "@/lib/data/module-enrollments";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AttendanceList from "./AttendanceList";

export default async function TeacherModuleAttendancePage({
  params,
}: {
  params: Promise<{ moduleSlug: string }>;
}) {
  const { moduleSlug } = await params;
  const module_ = await getModuleBySlug(moduleSlug);
  if (!module_) notFound();

  const supabase = await createClient();
  const [sessionsRes, students, attendanceRes] = supabase
    ? await Promise.all([
        supabase
          .from("module_sessions")
          .select("id, date, time, topic, status")
          .eq("module_id", module_.id)
          .eq("is_archived", false)
          .order("date", { ascending: false })
          .limit(20),
        getEnrolledStudents(module_.id),
        (async () => {
          const { data: sessionRows } = await supabase
            .from("module_sessions")
            .select("id")
            .eq("module_id", module_.id)
            .eq("is_archived", false);
          const sessionIds = (sessionRows ?? []).map((s: { id: string }) => s.id);
          if (sessionIds.length === 0) return [];
          const { data } = await supabase
            .from("module_attendance")
            .select("id, session_id, user_id, status")
            .in("session_id", sessionIds);
          return data ?? [];
        })(),
      ])
    : [{ data: [] }, [], []];

  const sessions = (sessionsRes && "data" in sessionsRes ? sessionsRes.data : []) as { id: string; date: string; time: string | null; topic: string | null; status: string }[];
  const attendance = (Array.isArray(attendanceRes) ? attendanceRes : []) as { id: string; session_id: string; user_id: string; status: string }[];

  return (
    <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
      <h2 className="font-heading text-lg font-normal text-deep-green">
        Attendance — {module_.title}
      </h2>
      <p className="mt-2 text-sm text-foreground/80">
        Mark attendance for sessions. Only enrolled students are listed.
      </p>
      <AttendanceList
        moduleId={module_.id}
        sessions={sessions}
        students={students}
        attendance={attendance}
      />
    </div>
  );
}
