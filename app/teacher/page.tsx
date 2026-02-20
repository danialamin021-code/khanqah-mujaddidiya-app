import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserRoles, getAssignedModuleSlugs } from "@/lib/auth";
import { getAllModules, getAssignedModulesForUser } from "@/lib/data/modules";
import { MODULE_IMAGES } from "@/lib/constants/modules";
import { LEARNING_MODULES } from "@/lib/constants/modules";
import Image from "next/image";

/**
 * Teacher dashboard — assigned modules overview.
 * Teachers see only assigned modules; admins/directors see all.
 */
export default async function TeacherDashboardPage() {
  const [roles, assignedSlugs] = await Promise.all([
    getUserRoles(),
    getAssignedModuleSlugs(),
  ]);
  const isAdminOrDirector = roles.includes("admin") || roles.includes("director");

  let modulesToShow: { slug: string; title: string }[];
  try {
    const supabase = await createClient();
    if (!supabase) throw new Error("No client");
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const dbModules = isAdminOrDirector
      ? await getAllModules()
      : userId
        ? await getAssignedModulesForUser(userId)
        : [];

    modulesToShow =
      dbModules.length > 0
        ? dbModules.map((m) => ({ slug: m.slug, title: m.title }))
        : isAdminOrDirector
          ? LEARNING_MODULES.map((m) => ({ slug: m.slug, title: m.name }))
          : LEARNING_MODULES.filter((m) => assignedSlugs.includes(m.slug)).map((m) => ({
              slug: m.slug,
              title: m.name,
            }));
  } catch {
    modulesToShow = isAdminOrDirector
      ? LEARNING_MODULES.map((m) => ({ slug: m.slug, title: m.name }))
      : LEARNING_MODULES.filter((m) => assignedSlugs.includes(m.slug)).map((m) => ({
          slug: m.slug,
          title: m.name,
        }));
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-normal text-deep-green">
        Teacher Dashboard
      </h1>
      <p className="mt-2 text-sm text-foreground/70">
        {isAdminOrDirector
          ? "You have full access to all modules."
          : "Modules assigned to you."}
      </p>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-normal text-deep-green mb-4">My Batches</h2>
        <Link
          href="/teacher/batches"
          className="inline-block rounded-lg border border-green-soft bg-light-green/50 px-4 py-2 text-sm font-medium text-deep-green transition-colors hover:bg-light-green"
        >
          View Batches →
        </Link>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-normal text-deep-green mb-4">Modules</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modulesToShow.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-green-soft bg-light-green/40 p-6">
            <p className="text-foreground/80">
              No modules assigned yet. Contact an admin to get assigned to modules.
            </p>
          </div>
        ) : (
          modulesToShow.map((m) => {
            const imageSrc = MODULE_IMAGES[m.slug as keyof typeof MODULE_IMAGES] ?? "/assets/Modules/tafseer.jpg";
            return (
            <Link
              key={m.slug}
              href={`/teacher/${m.slug}`}
              className="group overflow-hidden rounded-2xl border border-green-soft bg-light-green/50 shadow-sm transition-all hover:border-deep-green/30 hover:shadow-md"
            >
              <div className="relative h-32">
                <Image
                  src={imageSrc}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-black/40" />
                <span className="absolute bottom-3 left-3 font-heading text-lg font-normal text-white drop-shadow">
                  {m.title}
                </span>
              </div>
              <div className="p-4">
                <span className="text-sm font-medium text-deep-green">
                  Overview, Sessions, Students, Attendance, Resources, Announcements
                </span>
              </div>
            </Link>
          );
          })
        )}
      </div>
      </section>
    </div>
  );
}
