import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ReportsOverview() {
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
      // Tables may not exist or RLS may deny; show zeros
    }
  }

  return (
    <section className="border-t border-light-green bg-[var(--background)] px-4 py-8 md:py-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-heading text-xl font-normal text-deep-green">
          Reports Overview
        </h2>
        <p className="mt-1 text-sm text-foreground/70">
          Quick stats. Full reports in Admin.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <p className="text-sm font-medium text-deep-green/90">Students</p>
            <p className="mt-1 text-2xl font-heading text-deep-green">{studentCount}</p>
          </div>
          <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <p className="text-sm font-medium text-deep-green/90">Teachers</p>
            <p className="mt-1 text-2xl font-heading text-deep-green">{teacherCount}</p>
          </div>
          <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <p className="text-sm font-medium text-deep-green/90">Modules</p>
            <p className="mt-1 text-2xl font-heading text-deep-green">{moduleCount}</p>
          </div>
          <Link
            href="/admin/reports"
            className="flex items-center justify-center rounded-2xl border border-green-soft bg-light-green/50 p-6 transition-colors hover:bg-light-green"
          >
            <span className="text-sm font-medium text-deep-green">View full reports →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
