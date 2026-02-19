import { notFound } from "next/navigation";
import Link from "next/link";
import { requireModuleAccessBySlug } from "@/lib/auth";
import { getModuleBySlug } from "@/lib/data/modules";

const SUB_NAV = [
  { href: "overview", label: "Overview" },
  { href: "sessions", label: "Sessions" },
  { href: "students", label: "Students" },
  { href: "attendance", label: "Attendance" },
  { href: "resources", label: "Resources" },
  { href: "announcements", label: "Announcements" },
] as const;

export default async function TeacherModuleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ moduleSlug: string }>;
}) {
  const { moduleSlug } = await params;
  const module_ = await getModuleBySlug(moduleSlug);
  if (!module_) notFound();

  await requireModuleAccessBySlug(moduleSlug);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/teacher"
          className="text-sm font-medium text-deep-green/80 hover:text-deep-green"
        >
          ← All modules
        </Link>
        <span className="text-foreground/50">/</span>
        <span className="font-heading text-lg font-normal text-deep-green">
          {module_.title}
        </span>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-green-soft pb-4">
        {SUB_NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={`/teacher/${moduleSlug}/${href}`}
            className="rounded-lg border border-green-soft bg-light-green/40 px-4 py-2 text-sm font-medium text-deep-green/90 transition-colors hover:bg-light-green"
          >
            {label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
