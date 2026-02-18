import Link from "next/link";
import { getAllPaths } from "@/lib/data/paths";
import { getAllAnnouncements } from "@/lib/data/announcements";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAnnouncementsPage() {
  const [announcements, paths] = await Promise.all([
    getAllAnnouncements(),
    getAllPaths(),
  ]);
  const supabase = await createClient();
  const pathIdToSlug = new Map<string, string>();
  const pathIdToTitle = new Map<string, string>();
  paths.forEach((p) => {
    pathIdToSlug.set(p.id, p.slug);
    pathIdToTitle.set(p.id, p.title);
  });
  const sessionIdToSlug = new Map<string, string>();
  if (supabase) {
    const { data: sessions } = await supabase.from("sessions").select("id, slug");
    sessions?.forEach((s: { id: string; slug: string }) => sessionIdToSlug.set(s.id, s.slug));
  }

  function scopeLabel(a: { path_id: string | null; session_id: string | null }): string {
    if (!a.path_id) return "Global";
    const pathSlug = pathIdToSlug.get(a.path_id) ?? a.path_id;
    const pathTitle = pathIdToTitle.get(a.path_id) ?? pathSlug;
    if (!a.session_id) return `Path: ${pathTitle}`;
    const sessionSlug = sessionIdToSlug.get(a.session_id) ?? a.session_id;
    return `Session: ${pathTitle} / ${sessionSlug}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          Live announcements
        </h1>
        <Link
          href="/admin/announcements/new"
          className="rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
        >
          New announcement
        </Link>
      </div>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Students see these read-only on session pages. Scope: global, path, or session.
      </p>
      {announcements.length === 0 ? (
        <p className="mt-8 text-neutral-500 dark:text-neutral-400">
          No announcements yet.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {announcements.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/50"
            >
              <div>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {a.title}
                </span>
                <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {scopeLabel(a)}
                </span>
                {a.body && (
                  <p className="mt-1 line-clamp-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {a.body}
                  </p>
                )}
              </div>
              <Link
                href={`/admin/announcements/${a.id}/edit`}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
