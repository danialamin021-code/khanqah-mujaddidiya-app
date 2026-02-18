import Link from "next/link";
import { redirect } from "next/navigation";
import { createAnnouncement } from "@/app/actions/admin-announcements";

export default function AdminNewAnnouncementPage() {
  async function submit(formData: FormData) {
    "use server";
    const result = await createAnnouncement({
      path_slug: (formData.get("path_slug") as string)?.trim() || null,
      session_slug: (formData.get("session_slug") as string)?.trim() || null,
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
        New announcement
      </h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Leave path and session empty for a global announcement. Use path slug (e.g. intro) and session slug (e.g. welcome) for scoped announcements.
      </p>
      <form action={submit} className="mt-6 max-w-xl space-y-4">
        <div>
          <label htmlFor="path_slug" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Path slug (optional)
          </label>
          <input
            id="path_slug"
            name="path_slug"
            type="text"
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            placeholder="e.g. intro"
          />
        </div>
        <div>
          <label htmlFor="session_slug" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Session slug (optional, requires path)
          </label>
          <input
            id="session_slug"
            name="session_slug"
            type="text"
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            placeholder="e.g. welcome"
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
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
            defaultValue={0}
            className="mt-1 w-full max-w-[120px] rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            Create announcement
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
