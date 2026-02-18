import { getModuleBySlug } from "@/lib/data/modules";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SessionsList from "./SessionsList";

export default async function TeacherModuleSessionsPage({
  params,
}: {
  params: Promise<{ moduleSlug: string }>;
}) {
  const { moduleSlug } = await params;
  const module_ = await getModuleBySlug(moduleSlug);
  if (!module_) notFound();

  const supabase = await createClient();
  const { data: sessions } = supabase
    ? await supabase
        .from("module_sessions")
        .select("id, date, time, topic, zoom_link, status, updated_at")
        .eq("module_id", module_.id)
        .eq("is_archived", false)
        .order("date", { ascending: true })
    : { data: [] };

  return (
    <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
      <h2 className="font-heading text-lg font-normal text-deep-green">
        Sessions — {module_.title}
      </h2>
      <p className="mt-2 text-sm text-foreground/80">
        Create and manage sessions for this module. Updates appear in real time.
      </p>
      <SessionsList
        moduleId={module_.id}
        moduleSlug={moduleSlug}
        initialSessions={(sessions ?? []) as { id: string; date: string; time: string | null; topic: string | null; zoom_link: string | null; status: string }[]}
      />
    </div>
  );
}
