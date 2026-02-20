import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getBatchById,
  getBatchSessions,
  getBatchEnrollmentsWithParticipation,
} from "@/lib/data/batches";
import BatchAttendanceMarking from "./BatchAttendanceMarking";
import BatchSessionAddForm from "./BatchSessionAddForm";

/**
 * Teacher — Batch detail: students, sessions, attendance marking.
 */
export default async function TeacherBatchDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [batch, sessionsData, enrollmentsData] = await Promise.all([
    getBatchById(batchId),
    getBatchSessions(batchId, 100),
    getBatchEnrollmentsWithParticipation(batchId, 1),
  ]);

  const enrollmentsForAttendance = enrollmentsData.rows.map((r) => ({
    user_id: r.enrollment.user_id,
    full_name: r.enrollment.full_name,
  }));

  if (!batch) notFound();

  const isTeacher = batch.teacher_id === user.id;
  const isAdmin = await (async () => {
    const { data } = await supabase.from("profiles").select("roles").eq("id", user.id).single();
    const roles = (data as { roles?: string[] } | null)?.roles ?? [];
    return roles.includes("admin") || roles.includes("director");
  })();

  if (!isTeacher && !isAdmin) notFound();

  return (
    <div>
      <Link
        href="/teacher/batches"
        className="text-sm font-medium text-deep-green/80 hover:text-deep-green"
      >
        ← My Batches
      </Link>

      <section className="mt-6 rounded-2xl border border-green-soft bg-light-green/50 p-6">
        <h1 className="font-heading text-2xl font-normal text-deep-green">{batch.name}</h1>
        {batch.description && (
          <p className="mt-2 text-sm text-foreground/80">{batch.description}</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-normal text-deep-green">Students</h2>
        <p className="mt-1 text-sm text-foreground/70">
          Attendance %, sessions attended, WhatsApp, enrollment date.
        </p>
        {enrollmentsData.rows.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/70">No students enrolled yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-green-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-soft bg-light-green/60">
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-deep-green">WhatsApp</th>
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Attendance %</th>
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Sessions</th>
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Enrolled</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--background)]">
                {enrollmentsData.rows.map(({ enrollment, participation }) => (
                  <tr key={enrollment.id} className="border-b border-green-soft/80 last:border-0">
                    <td className="px-4 py-3 font-medium text-deep-green/90">
                      {enrollment.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground/90">{enrollment.whatsapp ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          (participation?.attendance_percentage ?? 0) >= 80
                            ? "bg-green-600/20 text-green-700 dark:text-green-400"
                            : (participation?.attendance_percentage ?? 0) >= 50
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                              : "bg-red-500/20 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {participation?.attendance_percentage ?? 0}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground/90">
                      {participation?.sessions_attended ?? 0} / {participation?.total_sessions ?? 0}
                    </td>
                    <td className="px-4 py-3 text-foreground/90">
                      {new Date(enrollment.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {enrollmentsData.totalCount > enrollmentsData.rows.length && (
              <p className="px-4 py-2 text-xs text-foreground/70">
                Showing {enrollmentsData.rows.length} of {enrollmentsData.totalCount}
              </p>
            )}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-normal text-deep-green">Sessions</h2>
        <p className="mt-1 text-sm text-foreground/70">Add and manage batch sessions.</p>
        <BatchSessionAddForm batchId={batchId} />
        {sessionsData.sessions.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-green-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-soft bg-light-green/60">
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Topic</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--background)]">
                {sessionsData.sessions.map((s) => (
                  <tr key={s.id} className="border-b border-green-soft/80 last:border-0">
                    <td className="px-4 py-3 text-foreground/90">
                      {new Date(s.session_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-deep-green/90">{s.title}</td>
                    <td className="px-4 py-3 text-foreground/90">{s.topic ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-normal text-deep-green">Attendance</h2>
        <p className="mt-1 text-sm text-foreground/70">
          Module → Batch → Session → Mark Attendance
        </p>
        <BatchAttendanceMarking
          batchId={batchId}
          sessions={sessionsData.sessions}
          enrollments={enrollmentsForAttendance}
        />
      </section>
    </div>
  );
}
