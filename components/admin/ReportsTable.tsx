"use client";

export interface ReportStat {
  label: string;
  value: string | number;
  sublabel?: string;
}

export interface AttendanceHealth {
  overallAttendancePercentage: number;
  studentsBelow60Percent: number;
  modulesBelow70Percent: number;
}

export interface ModulePerformanceRow {
  moduleId: string;
  moduleName: string;
  teacherName: string;
  totalStudents: number;
  totalSessions: number;
  averageAttendance: number;
}

export default function ReportsTable({
  stats,
  attendanceHealth,
  modulePerformance = [],
}: {
  stats: ReportStat[];
  attendanceHealth?: AttendanceHealth;
  modulePerformance?: ModulePerformanceRow[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-green-soft bg-light-green/50 p-6"
          >
            <p className="text-sm font-medium text-deep-green/90">{s.label}</p>
            <p className="mt-1 text-2xl font-heading text-deep-green">{s.value}</p>
            {s.sublabel && (
              <p className="mt-1 text-xs text-foreground/60">{s.sublabel}</p>
            )}
          </div>
        ))}
      </div>

      {attendanceHealth && (
        <div className="rounded-2xl border border-green-soft bg-light-green/30 p-6">
          <h3 className="font-heading text-lg font-normal text-deep-green">
            Attendance Health
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-green-soft bg-[var(--background)] p-4">
              <p className="text-sm font-medium text-deep-green/90">Overall Attendance</p>
              <p className="mt-1 text-2xl font-heading text-deep-green">
                {attendanceHealth.overallAttendancePercentage}%
              </p>
            </div>
            <div className="rounded-xl border border-green-soft bg-[var(--background)] p-4">
              <p className="text-sm font-medium text-deep-green/90">Students Below 60%</p>
              <p className="mt-1 text-2xl font-heading text-deep-green">
                {attendanceHealth.studentsBelow60Percent}
              </p>
            </div>
            <div className="rounded-xl border border-green-soft bg-[var(--background)] p-4">
              <p className="text-sm font-medium text-deep-green/90">Modules Below 70%</p>
              <p className="mt-1 text-2xl font-heading text-deep-green">
                {attendanceHealth.modulesBelow70Percent}
              </p>
            </div>
          </div>
        </div>
      )}

      {modulePerformance && modulePerformance.length > 0 && (
        <div className="rounded-2xl border border-green-soft bg-light-green/30 p-6">
          <h3 className="font-heading text-lg font-normal text-deep-green">
            Module Performance
          </h3>
          <p className="mt-1 text-sm text-foreground/70">
            Per-module enrollment and average attendance.
          </p>
          <div className="mt-4 overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[500px] text-sm">
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
                {modulePerformance.map((row) => (
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
        </div>
      )}
    </div>
  );
}
