import { redirect } from "next/navigation";
import Link from "next/link";
import { requireTeacher } from "@/lib/auth";

/**
 * Teacher panel layout. Only teachers, admins, and directors can access.
 */
export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const canAccess = await requireTeacher();
  if (!canAccess) redirect("/unauthorized");

  return (
    <div className="min-h-full">
      <header className="border-b border-green-soft bg-light-green/30 px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/teacher"
            className="font-heading text-lg font-normal text-deep-green"
          >
            Teacher Panel
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/teacher/sessions"
              className="text-deep-green/80 hover:text-deep-green"
            >
              Sessions
            </Link>
            <Link
              href="/teacher/students"
              className="text-deep-green/80 hover:text-deep-green"
            >
              Students
            </Link>
            <Link
              href="/teacher/attendance"
              className="text-deep-green/80 hover:text-deep-green"
            >
              Attendance
            </Link>
            <Link
              href="/teacher/resources"
              className="text-deep-green/80 hover:text-deep-green"
            >
              Resources
            </Link>
            <Link
              href="/teacher/announcements"
              className="text-deep-green/80 hover:text-deep-green"
            >
              Announcements
            </Link>
            <Link
              href="/home"
              className="text-deep-green/70 hover:text-deep-green"
            >
              ← App
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">{children}</main>
    </div>
  );
}
