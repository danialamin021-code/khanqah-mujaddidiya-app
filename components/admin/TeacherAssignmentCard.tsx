import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherAssignmentCard() {
  const supabase = await createClient();
  let assignmentCount = 0;

  if (supabase) {
    try {
      const { data } = await supabase
        .from("module_teachers")
        .select("id");
      assignmentCount = data?.length ?? 0;
    } catch {
      assignmentCount = 0;
    }
  }

  return (
    <section className="rounded-2xl border border-green-soft bg-light-green/30 p-6">
      <h2 className="font-heading text-lg font-normal text-deep-green">
        Teacher Assignment
      </h2>
      <p className="mt-1 text-sm text-foreground/70">
        Assign teachers to modules. View assigned modules.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/admin/assignments"
          className="rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
        >
          Manage Assignments
        </Link>
        <Link
          href="/admin/users"
          className="rounded-lg border border-green-soft px-4 py-2 text-sm font-medium text-deep-green transition-colors hover:bg-light-green/50"
        >
          View Users
        </Link>
      </div>
      <p className="mt-3 text-sm text-foreground/60">
        Current assignments: {assignmentCount}
      </p>
    </section>
  );
}
