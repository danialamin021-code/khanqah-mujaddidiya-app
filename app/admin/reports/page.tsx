import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ReportsTable from "@/components/admin/ReportsTable";

/**
 * Reports — enrollment, attendance, session completions, student progress.
 */
export default async function AdminReportsPage() {
  const supabase = await createClient();
  let studentCount = 0;
  let teacherCount = 0;
  let moduleCount = 0;
  let enrollmentCount = 0;

  if (supabase) {
    try {
      const [profilesRes, teachersRes, modulesRes, enrollmentsRes] = await Promise.all([
        supabase.from("profiles").select("id"),
        supabase.from("profiles").select("id").contains("roles", ["teacher"]),
        supabase.from("modules").select("id"),
        supabase.from("enrollments").select("id"),
      ]);
      studentCount = profilesRes.data?.length ?? 0;
      teacherCount = teachersRes.data?.length ?? 0;
      moduleCount = modulesRes.data?.length ?? 0;
      enrollmentCount = enrollmentsRes.data?.length ?? 0;
    } catch {
      // Fallback
    }
  }

  const stats = [
    { label: "Total Students", value: studentCount, sublabel: "Profiles" },
    { label: "Teachers", value: teacherCount, sublabel: "With teacher role" },
    { label: "Active Modules", value: moduleCount, sublabel: "Modules" },
    { label: "Enrollments", value: enrollmentCount, sublabel: "Path enrollments" },
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
        <ReportsTable stats={stats} />
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
