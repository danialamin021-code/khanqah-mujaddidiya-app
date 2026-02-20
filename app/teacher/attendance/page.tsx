import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBatchStatsForTeacher } from "@/lib/data/batches";

/**
 * Teacher attendance — layer: Module → Batch → Session → Mark Attendance.
 * Links to batch detail pages for marking.
 */
export default async function TeacherAttendancePage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-normal text-deep-green">Attendance</h1>
        <p className="mt-2 text-sm text-foreground/70">Unable to load.</p>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-normal text-deep-green">Attendance</h1>
        <p className="mt-2 text-sm text-foreground/70">Please sign in.</p>
      </div>
    );
  }

  const batches = await getBatchStatsForTeacher(user.id);

  return (
    <div>
      <h1 className="font-heading text-2xl font-normal text-deep-green">Attendance</h1>
      <p className="mt-2 text-sm text-foreground/70">
        Module → Batch → Session → Mark Attendance. Select a batch to mark.
      </p>
      {batches.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-green-soft bg-light-green/50 p-6">
          <p className="text-foreground/80">No batches assigned. Go to My Batches to get started.</p>
          <Link href="/teacher/batches" className="mt-4 inline-block text-sm font-medium text-deep-green hover:underline">
            My Batches →
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {batches.map((b) => (
            <Link
              key={b.id}
              href={`/teacher/batches/${b.id}`}
              className="block rounded-xl border border-green-soft bg-light-green/50 p-4 transition-colors hover:bg-light-green"
            >
              <span className="font-medium text-deep-green">{b.name}</span>
              <span className="ml-2 text-sm text-foreground/70">({b.moduleName})</span>
              <p className="mt-1 text-xs text-foreground/70">
                {b.studentsCount} students · Avg {b.avgAttendance}% · {b.upcomingSessions} upcoming
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
