import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllModules, getTeachersForModule } from "@/lib/data/modules";
import TeacherAssignForm from "./TeacherAssignForm";
import UnassignButton from "./UnassignButton";

interface PageProps {
  searchParams: Promise<{ module?: string }>;
}

export default async function AdminAssignmentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const modules = await getAllModules();
  const teacherLists = await Promise.all(modules.map((m) => getTeachersForModule(m.id)));
  const focusSlug = params.module;

  const supabase = await createClient();
  const { data: profiles } = supabase
    ? await supabase
        .from("profiles")
        .select("id, full_name, email, roles")
        .not("roles", "is", null)
    : { data: [] };
  const teachers = (profiles ?? []).filter((p) => {
    const roles = (p as { roles?: string[] }).roles ?? [];
    return roles.includes("teacher") || roles.includes("admin") || roles.includes("director");
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-normal text-deep-green">
        Teacher Assignment
      </h1>
      <p className="mt-2 text-sm text-foreground/70">
        Assign teachers to modules. Each teacher sees only their assigned modules.
      </p>

      {focusSlug && (() => {
        const idx = modules.findIndex((m) => m.slug === focusSlug);
        const assignedToFocus = idx >= 0 ? (teacherLists[idx] ?? []) : [];
        return (
          <div className="mt-6 rounded-2xl border border-green-soft bg-light-green/30 p-6">
            <TeacherAssignForm
              moduleSlug={focusSlug}
              modules={modules}
              teachers={teachers.map((t) => ({
                id: (t as { id: string }).id,
                fullName: (t as { full_name?: string }).full_name ?? (t as { email?: string }).email ?? "User",
                email: (t as { email?: string }).email,
              }))}
              assignedTeacherIds={assignedToFocus.map((t) => t.id)}
            />
          </div>
        );
      })()}

      <div className="mt-6 rounded-2xl border border-green-soft bg-light-green/50 p-6">
        <h2 className="font-heading text-lg font-normal text-deep-green">
          Modules & Assigned Teachers
        </h2>
        {modules.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/70">
            No modules yet. Create one in Module Management.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {modules.map((m, i) => (
              <li key={m.id} className="rounded-xl border border-green-soft bg-[var(--background)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-medium text-deep-green/90">{m.title}</span>
                    <span className="ml-2 text-sm text-foreground/60">/{m.slug}</span>
                  </div>
                  <Link
                    href={`/admin/assignments?module=${m.slug}`}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      focusSlug === m.slug
                        ? "bg-muted-gold text-white"
                        : "border border-green-soft text-deep-green hover:bg-light-green/50"
                    }`}
                  >
                    Assign Teacher
                  </Link>
                </div>
                {teacherLists[i]?.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {teacherLists[i].map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-2 rounded-lg border border-green-soft bg-light-green/30 px-3 py-1.5"
                      >
                        <span className="text-sm font-medium text-deep-green/90">{t.fullName}</span>
                        <UnassignButton moduleId={m.id} userId={t.id} teacherName={t.fullName} />
                      </div>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-foreground/60">No teachers assigned.</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href="/admin"
        className="mt-6 inline-block text-sm font-medium text-deep-green hover:underline"
      >
        ← Admin Dashboard
      </Link>
    </div>
  );
}
