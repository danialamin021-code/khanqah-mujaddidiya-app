import { getModuleBySlug } from "@/lib/data/modules";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AnnouncementsList from "./AnnouncementsList";

export default async function TeacherModuleAnnouncementsPage({
  params,
}: {
  params: Promise<{ moduleSlug: string }>;
}) {
  const { moduleSlug } = await params;
  const module_ = await getModuleBySlug(moduleSlug);
  if (!module_) notFound();

  const supabase = await createClient();
  const { data: announcements } = supabase
    ? await supabase
        .from("module_announcements")
        .select("id, title, content, updated_at")
        .eq("module_id", module_.id)
        .order("updated_at", { ascending: false })
    : { data: [] };

  return (
    <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
      <h2 className="font-heading text-lg font-normal text-deep-green">
        Announcements — {module_.title}
      </h2>
      <p className="mt-2 text-sm text-foreground/80">
        Post announcements for this module. Updates appear in real time.
      </p>
      <AnnouncementsList
        moduleId={module_.id}
        initialAnnouncements={(announcements ?? []) as { id: string; title: string; content: string; updated_at: string }[]}
      />
    </div>
  );
}
