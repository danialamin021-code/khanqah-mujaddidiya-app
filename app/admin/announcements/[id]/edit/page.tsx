import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAnnouncementById } from "@/lib/data/announcements";
import { updateAnnouncement } from "@/app/actions/admin-announcements";
import { createClient } from "@/lib/supabase/server";

export default async function AdminEditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const announcement = await getAnnouncementById(id);
  if (!announcement) notFound();

  let scopeLabel = "Global";
  if (announcement.path_id) {
    const supabase = await createClient();
    if (supabase) {
      const { data: path } = await supabase.from("learning_paths").select("slug, title").eq("id", announcement.path_id).single();
      scopeLabel = path ? `Path: ${path.title} (/${path.slug})` : "Path";
      if (announcement.session_id) {
        const { data: session } = await supabase.from("sessions").select("slug").eq("id", announcement.session_id).single();
        scopeLabel = session ? `${scopeLabel} / Session: ${session.slug}` : scopeLabel;
      }
    }
  }

  async function submit(formData: FormData) {
    "use server";
    const result = await updateAnnouncement(id, {
      title: (formData.get("title") as string) ?? "",
      body: (formData.get("body") as string) ?? "",
      sort_order: parseInt((formData.get("sort_order") as string) || "0", 10),
    });
    if (!result.error) redirect("/admin/announcements");
  }

  return (
    <div>
      <Link
        href="/admin/announcements"
        className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        ← Back to announcements
      </Link>
      <h1 className="mt-4 text-2xl font-light text-neutral-800 dark:text-neutral-100">
        Edit announcement
      </h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Scope: {scopeLabel} (cannot be changed)
      </p>
      <form action={submit} className="mt-6 max-w-xl space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={announcement.title}
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Body
          </label>
          <textarea
            id="body"
            name="body"
            rows={4}
            defaultValue={announcement.body}
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
        <div>
          <label htmlFor="sort_order" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Sort order
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={announcement.sort_order}
            className="mt-1 w-full max-w-[120px] rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            Save
          </button>
          <Link
            href="/admin/announcements"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
