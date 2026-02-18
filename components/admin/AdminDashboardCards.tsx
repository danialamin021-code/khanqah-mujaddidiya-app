import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardCards() {
  const supabase = await createClient();
  let studentCount = 0;
  let teacherCount = 0;
  let moduleCount = 0;

  if (supabase) {
    try {
      const [profilesRes, teachersRes, modulesRes] = await Promise.all([
        supabase.from("profiles").select("id"),
        supabase.from("profiles").select("id").contains("roles", ["teacher"]),
        supabase.from("modules").select("id"),
      ]);
      studentCount = profilesRes.data?.length ?? 0;
      teacherCount = teachersRes.data?.length ?? 0;
      moduleCount = modulesRes.data?.length ?? 0;
    } catch {
      // Fallback to zeros
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Link
        href="/admin/users"
        className="rounded-2xl border border-green-soft bg-light-green/50 p-6 transition-colors hover:bg-light-green"
      >
        <p className="text-sm font-medium text-deep-green/90">Total Students</p>
        <p className="mt-1 text-2xl font-heading text-deep-green">{studentCount}</p>
        <p className="mt-1 text-xs text-foreground/60">View users →</p>
      </Link>
      <Link
        href="/admin/assignments"
        className="rounded-2xl border border-green-soft bg-light-green/50 p-6 transition-colors hover:bg-light-green"
      >
        <p className="text-sm font-medium text-deep-green/90">Teachers</p>
        <p className="mt-1 text-2xl font-heading text-deep-green">{teacherCount}</p>
        <p className="mt-1 text-xs text-foreground/60">Assign to modules →</p>
      </Link>
      <Link
        href="/admin/modules"
        className="rounded-2xl border border-green-soft bg-light-green/50 p-6 transition-colors hover:bg-light-green"
      >
        <p className="text-sm font-medium text-deep-green/90">Active Modules</p>
        <p className="mt-1 text-2xl font-heading text-deep-green">{moduleCount}</p>
        <p className="mt-1 text-xs text-foreground/60">Manage modules →</p>
      </Link>
      <Link
        href="/admin/reports"
        className="rounded-2xl border border-green-soft bg-light-green/50 p-6 transition-colors hover:bg-light-green"
      >
        <p className="text-sm font-medium text-deep-green/90">Reports</p>
        <p className="mt-1 text-2xl font-heading text-deep-green">—</p>
        <p className="mt-1 text-xs text-foreground/60">View reports →</p>
      </Link>
    </div>
  );
}
