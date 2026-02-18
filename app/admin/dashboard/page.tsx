import Link from "next/link";
import {
  getPlatformStats,
  getPlatformAttendanceHealth,
  getModulePerformance,
  getRiskAlerts,
} from "@/lib/data/admin-analytics";

export default async function AdminDashboardAnalyticsPage() {
  const [stats, health, performance, alerts] = await Promise.all([
    getPlatformStats(),
    getPlatformAttendanceHealth(),
    getModulePerformance(),
    getRiskAlerts(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          Analytics Dashboard
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Real-time platform stats, attendance health, and module performance.
        </p>
      </div>

      {/* 1. Stats Cards */}
      <section>
        <h2 className="font-heading text-lg font-normal text-deep-green mb-4">
          Platform Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <p className="text-sm font-medium text-deep-green/90">Total Students</p>
            <p className="mt-1 text-2xl font-heading text-deep-green">{stats.totalStudents}</p>
            <Link href="/admin/users" className="mt-1 block text-xs text-deep-green/80 hover:underline">
              View users →
            </Link>
          </div>
          <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <p className="text-sm font-medium text-deep-green/90">Total Teachers</p>
            <p className="mt-1 text-2xl font-heading text-deep-green">{stats.totalTeachers}</p>
            <Link href="/admin/assignments" className="mt-1 block text-xs text-deep-green/80 hover:underline">
              Assignments →
            </Link>
          </div>
          <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <p className="text-sm font-medium text-deep-green/90">Active Modules</p>
            <p className="mt-1 text-2xl font-heading text-deep-green">{stats.totalModules}</p>
            <Link href="/admin/modules" className="mt-1 block text-xs text-deep-green/80 hover:underline">
              Manage →
            </Link>
          </div>
          <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <p className="text-sm font-medium text-deep-green/90">Sessions Conducted</p>
            <p className="mt-1 text-2xl font-heading text-deep-green">{stats.totalSessionsConducted}</p>
          </div>
        </div>
      </section>

      {/* 2. Attendance Health */}
      <section className="rounded-2xl border border-green-soft bg-light-green/30 p-6">
        <h2 className="font-heading text-lg font-normal text-deep-green">
          Attendance Health
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-green-soft bg-[var(--background)] p-4">
            <p className="text-sm font-medium text-deep-green/90">Overall Attendance</p>
            <p className="mt-1 text-2xl font-heading text-deep-green">
              {health.overallAttendancePercentage}%
            </p>
          </div>
          <div className="rounded-xl border border-green-soft bg-[var(--background)] p-4">
            <p className="text-sm font-medium text-deep-green/90">Students Below 60%</p>
            <p className="mt-1 text-2xl font-heading text-deep-green">
              {health.studentsBelow60Percent}
            </p>
          </div>
          <div className="rounded-xl border border-green-soft bg-[var(--background)] p-4">
            <p className="text-sm font-medium text-deep-green/90">Modules Below 70%</p>
            <p className="mt-1 text-2xl font-heading text-deep-green">
              {health.modulesBelow70Percent}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Risk Alerts */}
      {alerts.length > 0 && (
        <section className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6">
          <h2 className="font-heading text-lg font-normal text-amber-800 dark:text-amber-200">
            Risk Alerts
          </h2>
          <ul className="mt-4 space-y-2">
            {alerts.map((alert, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-[var(--background)] px-4 py-3"
              >
                <span className="text-amber-600 dark:text-amber-400">!</span>
                <div>
                  <p className="text-sm font-medium text-foreground/90">{alert.message}</p>
                  {alert.detail && (
                    <p className="text-xs text-foreground/70">{alert.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 4. Module Performance Table */}
      <section className="rounded-2xl border border-green-soft bg-light-green/30 p-6">
        <h2 className="font-heading text-lg font-normal text-deep-green">
          Module Performance
        </h2>
        <p className="mt-1 text-sm text-foreground/70">
          Per-module stats: students, sessions, average attendance.
        </p>
        {performance.length === 0 ? (
          <p className="mt-6 text-sm text-foreground/70">No modules yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-soft bg-light-green/60">
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Module</th>
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Teacher</th>
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Students</th>
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Sessions</th>
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Avg Attendance</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--background)]">
                {performance.map((row) => (
                  <tr key={row.moduleId} className="border-b border-green-soft/80 last:border-0">
                    <td className="px-4 py-3 font-medium text-deep-green/90">{row.moduleName}</td>
                    <td className="px-4 py-3 text-foreground/90">{row.teacherName}</td>
                    <td className="px-4 py-3 text-foreground/90">{row.totalStudents}</td>
                    <td className="px-4 py-3 text-foreground/90">{row.totalSessions}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          row.averageAttendance >= 80
                            ? "bg-green-600/20 text-green-700 dark:text-green-400"
                            : row.averageAttendance >= 60
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                              : "bg-red-500/20 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {row.averageAttendance}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin"
          className="text-sm font-medium text-deep-green hover:underline"
        >
          ← Admin Home
        </Link>
        <Link
          href="/admin/reports"
          className="text-sm font-medium text-deep-green hover:underline"
        >
          Reports →
        </Link>
      </div>
    </div>
  );
}
