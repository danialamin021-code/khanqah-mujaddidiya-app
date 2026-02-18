import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getStudentEnrollments,
  getStudentModuleStats,
  getModuleLiveSession,
} from "@/lib/data/student-dashboard";
import { getTeacherProgress } from "@/lib/data/teacher-progress";
import { getTeachersForModule } from "@/lib/data/modules";
import { getActiveRoleForServer } from "@/lib/auth";

function getStatusBadge(attendancePercentage: number): {
  label: string;
  className: string;
} {
  if (attendancePercentage >= 80) {
    return { label: "Excellent", className: "bg-green-600/20 text-green-700 dark:text-green-400" };
  }
  if (attendancePercentage >= 60) {
    return { label: "Needs Improvement", className: "bg-amber-500/20 text-amber-700 dark:text-amber-400" };
  }
  return { label: "Critical", className: "bg-red-500/20 text-red-700 dark:text-red-400" };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <main className="min-h-full px-4 py-8 md:py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-heading text-2xl font-normal text-deep-green">
            My Progress
          </h1>
          <p className="mt-2 text-foreground/70">
            Configure Supabase to see your progress.
          </p>
        </div>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const activeRole = await getActiveRoleForServer();

  // Admin/Director: redirect to admin dashboard
  if (activeRole === "admin") {
    redirect("/admin");
  }

  // Teacher: show teaching progress
  if (activeRole === "teacher") {
    const progress = await getTeacherProgress(user.id);
    return (
      <main className="min-h-full px-4 py-8 md:py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-heading text-2xl font-normal text-deep-green">
            My Progress
          </h1>
          <p className="mt-2 text-foreground/70">
            Your teaching activity across assigned modules.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-green-soft bg-light-green/50 p-4">
              <p className="text-sm font-medium text-deep-green/90">Modules Assigned</p>
              <p className="mt-1 text-2xl font-heading text-deep-green">{progress.totalModules}</p>
            </div>
            <div className="rounded-2xl border border-green-soft bg-light-green/50 p-4">
              <p className="text-sm font-medium text-deep-green/90">Sessions Created</p>
              <p className="mt-1 text-2xl font-heading text-deep-green">{progress.totalSessionsCreated}</p>
            </div>
            <div className="rounded-2xl border border-green-soft bg-light-green/50 p-4">
              <p className="text-sm font-medium text-deep-green/90">Attendance Marked</p>
              <p className="mt-1 text-2xl font-heading text-deep-green">{progress.totalAttendanceMarked}</p>
            </div>
          </div>
          {progress.modules.length > 0 ? (
            <ul className="mt-8 space-y-4">
              {progress.modules.map((m) => (
                <li
                  key={m.moduleId}
                  className="rounded-2xl border border-green-soft bg-light-green/30 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-heading text-lg font-normal text-deep-green">
                      {m.moduleTitle}
                    </h2>
                    <Link
                      href={`/teacher/${m.moduleSlug}`}
                      className="text-sm font-medium text-deep-green hover:underline"
                    >
                      Manage →
                    </Link>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-foreground/80">
                    <span>{m.sessionsCreated} sessions</span>
                    <span>{m.enrollments} enrolled</span>
                    <span>{m.attendanceMarked} attendance records</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 rounded-2xl border border-green-soft bg-light-green/40 p-6">
              <p className="text-foreground/80">
                No modules assigned yet. Contact an admin to get assigned to modules.
              </p>
            </div>
          )}
          <p className="mt-8 text-sm text-foreground/60">
            <Link href="/profile" className="text-deep-green/80 hover:text-deep-green">
              Profile & account
            </Link>
          </p>
        </div>
      </main>
    );
  }

  // Student: show enrollment progress
  const enrollments = await getStudentEnrollments(user.id);
  const cards = await Promise.all(
    enrollments.map(async (e) => {
      const [stats, teachers, liveSession] = await Promise.all([
        getStudentModuleStats(user.id, e.moduleId),
        getTeachersForModule(e.moduleId),
        getModuleLiveSession(e.moduleId),
      ]);
      const teacherName =
        teachers.length > 0
          ? teachers.map((t) => t.fullName).join(", ")
          : "—";
      const badge = getStatusBadge(stats.attendancePercentage);
      const learningTimePercentage =
        stats.totalSessions > 0
          ? Math.round((stats.attendedSessions / stats.totalSessions) * 100)
          : 0;
      return {
        ...e,
        ...stats,
        teacherName,
        badge,
        learningTimePercentage,
        liveSession,
      };
    })
  );

  return (
    <main className="min-h-full px-4 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          My Progress
        </h1>
        <p className="mt-2 text-foreground/70">
          Courses you are enrolled in and your progress. No pressure — learn at your pace.
        </p>
        {cards.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-green-soft bg-light-green/40 p-6">
            <p className="text-foreground/80">
              You are not enrolled in any modules yet. Visit{" "}
              <Link href="/modules" className="font-medium text-deep-green hover:underline">
                Modules
              </Link>{" "}
              to enroll when you are ready.
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-6">
            {cards.map((card) => (
              <li
                key={card.moduleId}
                className="rounded-2xl border border-green-soft bg-light-green/50 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-heading text-lg font-normal text-deep-green">
                    {card.moduleTitle}
                  </h2>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${card.badge.className}`}
                  >
                    {card.badge.label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground/70">
                  Teacher: {card.teacherName}
                </p>

                <div className="mt-4">
                  <p className="text-sm font-medium text-deep-green/90">
                    Learning Time
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/70">
                    {card.attendedSessions} of {card.totalSessions} sessions completed
                  </p>
                  <div className="mt-2 h-2 w-full rounded-full bg-green-soft">
                    <div
                      className="h-full rounded-full bg-muted-gold/80 transition-all"
                      style={{ width: `${card.learningTimePercentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-deep-green/90">
                    Attendance
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/70">
                    {card.attendedSessions} of {card.totalSessions} sessions attended
                  </p>
                  <div className="mt-2 h-2 w-full rounded-full bg-green-soft">
                    <div
                      className="h-full rounded-full bg-deep-green/70 transition-all"
                      style={{ width: `${card.attendancePercentage}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs font-medium text-deep-green/80">
                    {card.attendancePercentage}%
                  </p>
                </div>

                {card.liveSession && (
                  <div className="mt-4 rounded-lg border border-green-soft bg-light-green/40 p-3">
                    <p className="text-sm font-medium text-deep-green/90">
                      {card.liveSession.status === "live" ? "Live now" : "Next session"}
                    </p>
                    <p className="mt-0.5 text-xs text-foreground/70">
                      {card.liveSession.date} {card.liveSession.time ?? ""} — {card.liveSession.topic ?? "Session"}
                    </p>
                    {card.liveSession.zoomLink ? (
                      <a
                        href={card.liveSession.zoomLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
                      >
                        Join Session
                      </a>
                    ) : (
                      <p className="mt-2 text-xs text-foreground/60">
                        Zoom link will be shared by your teacher.
                      </p>
                    )}
                  </div>
                )}

                <Link
                  href={`/modules/${card.moduleSlug}`}
                  className="mt-4 inline-block rounded-lg border border-green-soft px-4 py-2 text-sm font-medium text-deep-green transition-colors hover:bg-light-green/50"
                >
                  View Module →
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-8 text-sm text-foreground/60">
          <Link href="/profile" className="text-deep-green/80 hover:text-deep-green">
            Profile & account
          </Link>
        </p>
      </div>
    </main>
  );
}
