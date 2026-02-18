import Link from "next/link";
import { getAllModules } from "@/lib/data/modules";
import { MODULE_IMAGES } from "@/lib/constants/modules";
import Image from "next/image";

export default async function ModuleOverviewCard() {
  const modules = await getAllModules();

  return (
    <section className="rounded-2xl border border-green-soft bg-light-green/30 p-6">
      <h2 className="font-heading text-lg font-normal text-deep-green">
        Modules Overview
      </h2>
      <p className="mt-1 text-sm text-foreground/70">
        Quick actions: edit, assign teacher, manage resources.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modules.length === 0 ? (
          <p className="col-span-full text-sm text-foreground/60">
            No modules yet. Create one in Module Management.
          </p>
        ) : (
          modules.map((m) => {
            const imageSrc = MODULE_IMAGES[m.slug as keyof typeof MODULE_IMAGES] ?? "/assets/Modules/tafseer.jpg";
            return (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-xl border border-green-soft bg-[var(--background)] p-3"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={imageSrc}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-deep-green/90">{m.title}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/modules?edit=${m.slug}`}
                      className="text-xs font-medium text-deep-green/80 hover:underline"
                    >
                      Edit
                    </Link>
                    <Link
                      href="/admin/assignments"
                      className="text-xs font-medium text-deep-green/80 hover:underline"
                    >
                      Assign
                    </Link>
                    <Link
                      href={`/modules/${m.slug}`}
                      className="text-xs font-medium text-deep-green/80 hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <Link
        href="/admin/modules"
        className="mt-4 inline-block text-sm font-medium text-deep-green hover:underline"
      >
        Full Module Management →
      </Link>
    </section>
  );
}
