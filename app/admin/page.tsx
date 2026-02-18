import Link from "next/link";
import AdminDashboardCards from "@/components/admin/AdminDashboardCards";
import ModuleOverviewCard from "@/components/admin/ModuleOverviewCard";
import TeacherAssignmentCard from "@/components/admin/TeacherAssignmentCard";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-normal text-deep-green">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-foreground/70">
            Overview of students, teachers, modules, and quick actions.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
        >
          Analytics Dashboard →
        </Link>
      </div>

      {/* 1. Dashboard Overview Cards */}
      <section>
        <h2 className="font-heading text-lg font-normal text-deep-green mb-4">
          Overview
        </h2>
        <AdminDashboardCards />
      </section>

      {/* 2. Modules Overview Section */}
      <section>
        <ModuleOverviewCard />
      </section>

      {/* 3. Teacher Assignment Section */}
      <section>
        <TeacherAssignmentCard />
      </section>

      {/* 4. Reports Section */}
      <section className="rounded-2xl border border-green-soft bg-light-green/30 p-6">
        <h2 className="font-heading text-lg font-normal text-deep-green">
          Reports
        </h2>
        <p className="mt-1 text-sm text-foreground/70">
          Enrollment, attendance, session completions, student progress.
        </p>
        <Link
          href="/admin/reports"
          className="mt-4 inline-block rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
        >
          View Reports →
        </Link>
      </section>

      {/* 5. Announcements Section */}
      <section className="rounded-2xl border border-green-soft bg-light-green/30 p-6">
        <h2 className="font-heading text-lg font-normal text-deep-green">
          Announcements
        </h2>
        <p className="mt-1 text-sm text-foreground/70">
          CRUD, schedule, assign to modules or global.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/announcements"
            className="rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
          >
            Manage Announcements
          </Link>
          <Link
            href="/admin/announcements/new"
            className="rounded-lg border border-green-soft px-4 py-2 text-sm font-medium text-deep-green transition-colors hover:bg-light-green/50"
          >
            New Announcement
          </Link>
        </div>
      </section>

      {/* 6. Learning Paths Management */}
      <section className="rounded-2xl border border-green-soft bg-light-green/30 p-6">
        <h2 className="font-heading text-lg font-normal text-deep-green">
          Learning Paths
        </h2>
        <p className="mt-1 text-sm text-foreground/70">
          CRUD paths, assign modules to paths.
        </p>
        <Link
          href="/admin/paths"
          className="mt-4 inline-block rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
        >
          Manage Paths →
        </Link>
      </section>

      {/* Quick links */}
      <section className="flex flex-wrap gap-3">
        <Link
          href="/admin/approvals"
          className="rounded-lg border border-green-soft bg-light-green/30 px-4 py-2 text-sm font-medium text-deep-green transition-colors hover:bg-light-green/50"
        >
          Pending Approvals
        </Link>
        <Link
          href="/admin/questions"
          className="rounded-lg border border-green-soft bg-light-green/30 px-4 py-2 text-sm font-medium text-deep-green transition-colors hover:bg-light-green/50"
        >
          Student Questions
        </Link>
      </section>
    </div>
  );
}
