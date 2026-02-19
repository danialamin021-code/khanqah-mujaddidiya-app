import Link from "next/link";
import { getModuleBySlug } from "@/lib/data/modules";
import { getModuleOverviewStats } from "@/lib/data/module-overview";
import { notFound } from "next/navigation";

export default async function TeacherModuleOverviewPage({
  params,
}: {
  params: Promise<{ moduleSlug: string }>;
}) {
  const { moduleSlug } = await params;
  const module_ = await getModuleBySlug(moduleSlug);
  if (!module_) notFound();

  const stats = await getModuleOverviewStats(module_.id);

  const cards = [
    { label: "Enrolled students", value: stats.enrollments, href: `students` },
    { label: "Sessions", value: stats.sessions, href: `sessions` },
    { label: "Resources", value: stats.resources, href: `resources` },
    { label: "Announcements", value: stats.announcements, href: `announcements` },
  ];

  return (
    <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
      <h2 className="font-heading text-lg font-normal text-deep-green">
        Overview — {module_.title}
      </h2>
      <p className="mt-2 text-sm text-foreground/80">
        Quick stats and links to manage this module.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={`/teacher/${moduleSlug}/${c.href}`}
            className="rounded-xl border border-green-soft bg-[var(--background)] p-4 transition-colors hover:bg-light-green/40"
          >
            <p className="text-2xl font-heading font-normal text-deep-green">{c.value}</p>
            <p className="mt-1 text-sm text-foreground/70">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
