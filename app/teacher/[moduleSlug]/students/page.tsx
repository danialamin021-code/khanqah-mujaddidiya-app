import { getModuleBySlug } from "@/lib/data/modules";
import { getEnrolledStudents } from "@/lib/data/module-enrollments";
import { notFound } from "next/navigation";

export default async function TeacherModuleStudentsPage({
  params,
}: {
  params: Promise<{ moduleSlug: string }>;
}) {
  const { moduleSlug } = await params;
  const module_ = await getModuleBySlug(moduleSlug);
  if (!module_) notFound();

  const students = await getEnrolledStudents(module_.id);

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
    </div>
  );
}
