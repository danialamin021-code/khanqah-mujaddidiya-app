import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ReportsTable from "@/components/admin/ReportsTable";
import {
  getModulePerformance,
  getPlatformAttendanceHealth,
} from "@/lib/data/admin-analytics";

/**
 * Reports — enrollment, attendance, session completions, student progress.
 */
export default async function AdminReportsPage() {
  const supabase = await createClient();
  let studentCount = 0;
  let teacherCount = 0;
  let moduleCount = 0;
  let pathEnrollmentCount = 0;
  let moduleEnrollmentCount = 0;

  if (supabase) {
    try {
      const [profilesRes, teachersRes, modulesRes, pathEnrollRes, moduleEnrollRes] = await Promise.all([
        supabase.from("profiles").select("id"),
        supabase.from("profiles").select("id").contains("roles", ["teacher"]),
        supabase.from("modules").select("id").eq("is_archived", false),
        supabase.from("enrollments").select("id"),
        supabase.from("module_enrollments").select("id").eq("is_archived", false),
      ]);
      studentCount = profilesRes.data?.length ?? 0;
      teacherCount = teachersRes.data?.length ?? 0;
      moduleCount = modulesRes.data?.length ?? 0;
      pathEnrollmentCount = pathEnrollRes.data?.length ?? 0;
      moduleEnrollmentCount = moduleEnrollRes.data?.length ?? 0;
    } catch {
      // Fallback
    }
  }

  const [health, performance] = await Promise.all([
    getPlatformAttendanceHealth(),
    getModulePerformance(),
  ]);

  const stats = [
    { label: "Total Students", value: studentCount, sublabel: "Profiles" },
    { label: "Teachers", value: teacherCount, sublabel: "With teacher role" },
    { label: "Active Modules", value: moduleCount, sublabel: "Modules" },
    { label: "Path Enrollments", value: pathEnrollmentCount, sublabel: "Learning path enrollments" },
    { label: "Module Enrollments", value: moduleEnrollmentCount, sublabel: "Module enrollments" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-normal text-deep-green">
        Reports
      </h1>
      <p className="mt-2 text-sm text-foreground/70">
        Enrollment, attendance, session completions, student progress.
      </p>
      <div className="mt-6">
        <ReportsTable
          stats={stats}
          attendanceHealth={health}
          modulePerformance={performance}
        />
      </div>
      <Link
        href="/admin"
        className="mt-6 inline-block text-sm font-medium text-deep-green hover:underline"
      >
        ← Admin
      </Link>
    </div>
  );
}
