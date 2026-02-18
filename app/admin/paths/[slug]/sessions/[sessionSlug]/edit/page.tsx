import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { getSessionBySlugs } from "@/lib/data/paths";
import { updateSession } from "@/app/actions/admin-sessions";

export default async function AdminEditSessionPage({
  params,
}: {
  params: Promise<{ slug: string; sessionSlug: string }>;
}) {
  const { slug, sessionSlug } = await params;
  const data = await getSessionBySlugs(slug, sessionSlug);
  if (!data) notFound();
  const { path, level, session } = data;

  async function submit(formData: FormData) {
    "use server";
    const result = await updateSession(slug, sessionSlug, {
      title: (formData.get("title") as string) ?? "",
      type: (formData.get("type") as string) ?? "reading",
      description: (formData.get("description") as string) ?? "",
      body: (formData.get("body") as string) ?? "",
      sort_order: parseInt((formData.get("sort_order") as string) || "0", 10),
    });
    if (!result.error) redirect(`/admin/paths/${slug}/sessions`);
  }

  return (
    <div>
      <Link
        href={`/admin/paths/${slug}/sessions`}
        className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        ← Back to sessions
      </Link>
      <h1 className="mt-4 text-2xl font-light text-neutral-800 dark:text-neutral-100">
        Edit session: {session.title}
      </h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Path: {path.title} · Level: {level.title} · Slug: /{session.slug}
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
            defaultValue={session.title}
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={session.type}
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          >
            <option value="reading">reading</option>
            <option value="audio">audio</option>
            <option value="practice">practice</option>
            <option value="announcement">announcement</option>
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Short description
          </label>
          <input
            id="description"
            name="description"
            type="text"
            defaultValue={session.description ?? ""}
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Body (main content)
          </label>
          <textarea
            id="body"
            name="body"
            rows={6}
            defaultValue={session.body ?? ""}
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
            defaultValue={session.sort_order}
            className="mt-1 w-full max-w-[120px] rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            Save changes
          </button>
          <Link
            href={`/admin/paths/${slug}/sessions`}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
