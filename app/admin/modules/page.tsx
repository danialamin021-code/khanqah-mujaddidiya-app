import Link from "next/link";
import { getAllModules } from "@/lib/data/modules";
import { MODULE_IMAGES } from "@/lib/constants/modules";
import Image from "next/image";
import ModuleEditForm from "./ModuleEditForm";
import ModuleCreateForm from "./ModuleCreateForm";
import ModuleDeleteButton from "./ModuleDeleteButton";

interface PageProps {
  searchParams: Promise<{ edit?: string; new?: string }>;
}

export default async function AdminModulesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const modules = await getAllModules();
  const editSlug = params.edit;
  const moduleToEdit = editSlug ? modules.find((m) => m.slug === editSlug) : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          Module Management
        </h1>
        <Link
          href="/admin/modules?new=1"
          className="rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
        >
          New Module
        </Link>
      </div>
      <p className="mt-2 text-sm text-foreground/70">
        Create modules, assign teachers, and manage resources.
      </p>

      {(params.new || moduleToEdit) && (
        <div className="mt-6 rounded-2xl border border-green-soft bg-light-green/30 p-6">
          {params.new ? (
            <ModuleCreateForm
              existingSlugs={modules.map((m) => m.slug)}
            />
          ) : moduleToEdit ? (
            <ModuleEditForm
              module={moduleToEdit}
              existingSlugs={modules.filter((m) => m.id !== moduleToEdit.id).map((m) => m.slug)}
            />
          ) : null}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-green-soft bg-light-green/50 p-6">
        <h2 className="font-heading text-lg font-normal text-deep-green">
          Current modules
        </h2>
        {modules.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/70">
            No modules yet. Create one to get started.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {modules.map((m) => {
              const imageSrc =
                MODULE_IMAGES[m.slug as keyof typeof MODULE_IMAGES] ??
                "/assets/Modules/tafseer.jpg";
              return (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-green-soft bg-[var(--background)] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={imageSrc}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <span className="font-medium text-deep-green/90">{m.title}</span>
                      <span className="ml-2 text-sm text-foreground/60">/{m.slug}</span>
                      {m.description && (
                        <p className="mt-0.5 line-clamp-1 text-sm text-foreground/70">
                          {m.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/modules?edit=${m.slug}`}
                      className="rounded-lg border border-green-soft px-3 py-1.5 text-sm font-medium text-deep-green transition-colors hover:bg-light-green/50"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/assignments?module=${m.slug}`}
                      className="rounded-lg border border-green-soft px-3 py-1.5 text-sm font-medium text-deep-green transition-colors hover:bg-light-green/50"
                    >
                      Assign
                    </Link>
                    <Link
                      href={`/modules/${m.slug}`}
                      className="rounded-lg border border-green-soft px-3 py-1.5 text-sm font-medium text-deep-green transition-colors hover:bg-light-green/50"
                    >
                      View
                    </Link>
                    <ModuleDeleteButton moduleId={m.id} moduleTitle={m.title} />
                  </div>
                </li>
              );
            })}
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
