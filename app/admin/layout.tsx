import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

/**
 * Admin area. Admins and directors can access.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const canAccess = await requireAdmin();
  if (!canAccess) redirect("/home");

  return (
    <div className="min-h-full">
      <header className="border-b border-green-soft bg-light-green/30 px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin"
            className="font-heading text-lg font-normal text-deep-green"
          >
            Admin
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm">
            <Link href="/admin/dashboard" className="text-deep-green/80 hover:text-deep-green">
              Dashboard
            </Link>
            <Link href="/admin/users?role=student" className="text-deep-green/80 hover:text-deep-green">
              Students
            </Link>
            <Link href="/admin/users?role=teacher" className="text-deep-green/80 hover:text-deep-green">
              Teachers
            </Link>
            <Link href="/admin/modules" className="text-deep-green/80 hover:text-deep-green">
              Modules
            </Link>
            <Link href="/admin/approvals" className="text-deep-green/80 hover:text-deep-green">
              Approvals
            </Link>
            <Link href="/admin/reports" className="text-deep-green/80 hover:text-deep-green">
              Reports
            </Link>
            <Link href="/admin/system-health" className="text-deep-green/80 hover:text-deep-green">
              System Health
            </Link>
            <Link href="/admin/activity-logs" className="text-deep-green/80 hover:text-deep-green">
              Activity Logs
            </Link>
            <Link href="/admin/assignments" className="text-deep-green/80 hover:text-deep-green">
              Assignments
            </Link>
            <Link href="/admin/paths" className="text-deep-green/80 hover:text-deep-green">
              Paths
            </Link>
            <Link href="/admin/announcements" className="text-deep-green/80 hover:text-deep-green">
              Announcements
            </Link>
            <Link href="/admin/questions" className="text-deep-green/80 hover:text-deep-green">
              Questions
            </Link>
            <Link href="/home" className="text-deep-green/70 hover:text-deep-green">
              ← App
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">{children}</main>
    </div>
  );
}
