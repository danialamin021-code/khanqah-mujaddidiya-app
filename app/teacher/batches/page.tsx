import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBatchStatsForTeacher } from "@/lib/data/batches";

/**
 * Teacher — My Batches. Shows batches assigned to the teacher.
 */
export default async function TeacherBatchesPage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-normal text-deep-green">My Batches</h1>
        <p className="mt-2 text-sm text-foreground/70">Unable to load batches.</p>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-normal text-deep-green">My Batches</h1>
        <p className="mt-2 text-sm text-foreground/70">Please sign in.</p>
      </div>
    );
  }

  const batches = await getBatchStatsForTeacher(user.id);

  return (
    <div>
      <h1 className="font-heading text-2xl font-normal text-deep-green">My Batches</h1>
      <p className="mt-2 text-sm text-foreground/70">
        Batches assigned to you. Manage students, sessions, and attendance.
      </p>

      {batches.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-green-soft bg-light-green/40 p-6">
          <p className="text-foreground/80">
            No batches assigned yet. Contact an admin to get assigned to batches.
          </p>
          <Link
            href="/teacher"
            className="mt-4 inline-block text-sm font-medium text-deep-green hover:underline"
          >
            ← Back to Teacher Dashboard
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {batches.map((b) => (
            <Link
              key={b.id}
              href={`/teacher/batches/${b.id}`}
              className="rounded-2xl border border-green-soft bg-light-green/50 p-6 transition-colors hover:bg-light-green hover:border-deep-green/30"
            >
              <h2 className="font-heading text-lg font-normal text-deep-green">{b.name}</h2>
              <p className="mt-1 text-sm text-foreground/70">{b.moduleName}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <span className="text-deep-green/90">{b.studentsCount} students</span>
                <span className="text-deep-green/90">Avg {b.avgAttendance}% attendance</span>
                <span className="text-deep-green/90">{b.upcomingSessions} upcoming</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
