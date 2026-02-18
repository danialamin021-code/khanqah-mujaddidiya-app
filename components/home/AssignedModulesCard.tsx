"use client";

import Link from "next/link";
import Image from "next/image";
import { MODULE_IMAGES } from "@/lib/constants/modules";

export interface AssignedModule {
  slug: string;
  title: string;
}

export default function AssignedModulesCard({
  modules,
  teacherName,
}: {
  modules: AssignedModule[];
  teacherName?: string;
}) {
  if (modules.length === 0) return null;

  return (
    <section className="border-t border-light-green bg-[var(--background)] px-4 py-8 md:py-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-heading text-xl font-normal text-deep-green">
          Your Assigned Modules
        </h2>
        <p className="mt-1 text-sm text-foreground/70">
          {teacherName ? (
            <>Teaching as <span className="font-medium text-deep-green/90">{teacherName}</span>. Manage sessions, students, and resources.</>
          ) : (
            "Modules you teach. Manage sessions, students, and resources."
          )}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const imageSrc = MODULE_IMAGES[m.slug as keyof typeof MODULE_IMAGES] ?? "/assets/Modules/tafseer.jpg";
            return (
              <Link
                key={m.slug}
                href={`/teacher/${m.slug}`}
                className="group overflow-hidden rounded-2xl border border-green-soft bg-light-green/50 shadow-sm transition-all hover:border-deep-green/30 hover:shadow-md"
              >
                <div className="relative h-28">
                  <Image
                    src={imageSrc}
                    alt=""
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <span className="absolute bottom-3 left-3 font-heading text-lg font-normal text-white drop-shadow">
                    {m.title}
                  </span>
                </div>
                <div className="p-4">
                  <span className="text-sm font-medium text-deep-green">
                    Manage module →
                  </span>
                  {teacherName && (
                    <p className="mt-1 text-xs text-foreground/60">
                      {m.title} — {teacherName}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
