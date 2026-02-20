import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getBatchById,
  getBatchSessions,
  getUserBatchEnrollment,
  getBatchParticipation,
  getStudentBatchAttendance,
} from "@/lib/data/batches";
import BatchEnrollButton from "./BatchEnrollButton";
import WhatsAppJoinButton from "./WhatsAppJoinButton";

export default async function BatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  if (!supabase) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const [batch, sessionsData, enrollment, participation, attendanceHistory] = await Promise.all([
    getBatchById(id),
    getBatchSessions(id, 1),
    getUserBatchEnrollment(id, user.id),
    getBatchParticipation(id, user.id),
    getStudentBatchAttendance(id, user.id, 1),
  ]);

  if (!batch) notFound();

  const isEnrolled = enrollment !== null && enrollment.enrollment_status === "active";
  const { data: mod } = await supabase
    .from("modules")
    .select("slug")
    .eq("id", batch.module_id)
    .single();
  const moduleSlug = (mod as { slug?: string } | null)?.slug ?? "modules";

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href={`/modules/${moduleSlug}`}
        className="text-sm font-medium text-deep-green/80 hover:text-deep-green"
      >
        ← Back to module
      </Link>

      <section className="mt-6 rounded-2xl border border-green-soft bg-light-green/50 p-6">
        <h1 className="font-heading text-2xl font-normal text-deep-green">{batch.name}</h1>
        {batch.description && (
          <p className="mt-2 text-sm text-foreground/80">{batch.description}</p>
        )}
      </section>

      {isEnrolled && batch.whatsapp_group_link && (
        <section className="mt-6 rounded-2xl border border-green-soft bg-light-green/30 p-6">
          <h2 className="font-heading text-sm font-normal text-deep-green">WhatsApp Group</h2>
          <a
            href={batch.whatsapp_group_link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block truncate text-sm text-muted-gold hover:underline"
          >
            {batch.whatsapp_group_link}
          </a>
          <WhatsAppJoinButton
            batchId={id}
            joined={enrollment?.joined_whatsapp ?? false}
          />
        </section>
      )}

      {isEnrolled && attendanceHistory.rows.length > 0 && (
        <section className="mt-6 rounded-2xl border border-green-soft bg-light-green/30 p-6">
          <h2 className="font-heading text-sm font-normal text-deep-green">Your Attendance History</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-soft bg-light-green/60">
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Session</th>
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Status</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--background)]">
                {attendanceHistory.rows.map((row, i) => (
                  <tr key={i} className="border-b border-green-soft/80 last:border-0">
                    <td className="px-4 py-3 text-foreground/90">
                      {new Date(row.session_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-deep-green/90">{row.session_title}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          row.status === "present"
                            ? "bg-green-600/20 text-green-700 dark:text-green-400"
                            : row.status === "late"
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                              : "bg-foreground/20 text-foreground/70"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {attendanceHistory.totalCount > attendanceHistory.rows.length && (
              <p className="mt-2 text-xs text-foreground/70">
                Showing {attendanceHistory.rows.length} of {attendanceHistory.totalCount}
              </p>
            )}
          </div>
        </section>
      )}

      {isEnrolled && participation && (
        <section className="mt-6 rounded-2xl border border-green-soft bg-light-green/30 p-6">
          <h2 className="font-heading text-sm font-normal text-deep-green">Your Participation</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-foreground/70">Sessions Attended</p>
              <p className="text-lg font-medium text-deep-green">
                {participation.sessions_attended} / {participation.total_sessions}
              </p>
            </div>
            <div>
              <p className="text-xs text-foreground/70">Attendance %</p>
              <p className="text-lg font-medium text-deep-green">
                {participation.attendance_percentage}%
              </p>
            </div>
            <div>
              <p className="text-xs text-foreground/70">Last Attended</p>
              <p className="text-sm text-foreground/90">
                {participation.last_attended_at
                  ? new Date(participation.last_attended_at).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-green-soft bg-light-green/30 p-6">
        <h2 className="font-heading text-sm font-normal text-deep-green">Sessions</h2>
        {sessionsData.sessions.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/70">No sessions scheduled yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
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
            {sessionsData.totalCount > sessionsData.sessions.length && (
              <p className="mt-2 text-xs text-foreground/70">
                Showing {sessionsData.sessions.length} of {sessionsData.totalCount} sessions
              </p>
            )}
          </div>
        )}
      </section>

      {!isEnrolled && (
        <div className="mt-8">
          <BatchEnrollButton
            batchName={batch.name}
            batchId={id}
            whatsappGroupLink={batch.whatsapp_group_link}
          />
        </div>
      )}
    </main>
  );
}
