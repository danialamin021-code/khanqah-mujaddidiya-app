import { getModuleBySlug } from "@/lib/data/modules";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ResourcesList from "./ResourcesList";

export default async function TeacherModuleResourcesPage({
  params,
}: {
  params: Promise<{ moduleSlug: string }>;
}) {
  const { moduleSlug } = await params;
  const module_ = await getModuleBySlug(moduleSlug);
  if (!module_) notFound();

  const supabase = await createClient();
  const { data: resources } = supabase
    ? await supabase
        .from("module_resources")
        .select("id, title, type, url")
        .eq("module_id", module_.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
      <h2 className="font-heading text-lg font-normal text-deep-green">
        Resources — {module_.title}
      </h2>
      <p className="mt-2 text-sm text-foreground/80">
        Add links, PDFs, or file URLs for students. They appear on the module page.
      </p>
      <ResourcesList
        moduleId={module_.id}
        moduleSlug={moduleSlug}
        initialResources={(resources ?? []) as { id: string; title: string; type: string; url: string }[]}
      />
    </div>
  );
}
