import Link from "next/link";
import { getModuleBySlug } from "@/lib/data/modules";
import { getEnrolledStudents } from "@/lib/data/module-enrollments";
import { notFound } from "next/navigation";

const PAGE_SIZE = 50;

export default async function TeacherModuleStudentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ moduleSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { moduleSlug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const module_ = await getModuleBySlug(moduleSlug);
  if (!module_) notFound();

  const { students, totalCount } = await getEnrolledStudents(module_.id, page, PAGE_SIZE);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
      <h2 className="font-heading text-lg font-normal text-deep-green">
        Students — {module_.title}
      </h2>
      <p className="mt-2 text-sm text-foreground/80">
        Students enrolled in this module only.
      </p>
      {students.length === 0 ? (
        <p className="mt-6 text-sm text-foreground/70">
          No students enrolled yet. Students will appear here when they enroll via the module page.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {students.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-green-soft bg-[var(--background)] px-4 py-3"
            >
              <span className="font-medium text-deep-green/90">
                {s.full_name ?? s.email ?? "Unknown"}
              </span>
              {s.email && (
                <span className="text-sm text-foreground/70">{s.email}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {page > 1 && (
            <Link
              href={`/teacher/${moduleSlug}/students?page=${page - 1}`}
              className="rounded-lg border border-green-soft px-4 py-2 text-sm font-medium text-deep-green hover:bg-light-green/50"
            >
              ← Previous
            </Link>
          )}
          <span className="text-sm text-foreground/70">
            Page {page} of {totalPages} ({totalCount} students)
          </span>
          {page < totalPages && (
            <Link
              href={`/teacher/${moduleSlug}/students?page=${page + 1}`}
              className="rounded-lg border border-green-soft px-4 py-2 text-sm font-medium text-deep-green hover:bg-light-green/50"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
