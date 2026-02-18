import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { getPathBySlug } from "@/lib/data/paths";
import { createSession } from "@/app/actions/admin-sessions";

export default async function AdminNewSessionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const path = await getPathBySlug(slug);
  if (!path) notFound();
  const firstLevel = path.levels[0];
  if (!firstLevel) {
    return (
      <div>
        <Link href={`/admin/paths/${slug}/sessions`} className="text-sm font-medium text-neutral-600">
          ← Back to sessions
        </Link>
        <p className="mt-4 text-neutral-500">This path has no levels. Add a level in the database first.</p>
      </div>
    );
  }

  async function submit(formData: FormData) {
    "use server";
    const pathRow = await getPathBySlug(slug);
    if (!pathRow?.levels[0]) return;
    const result = await createSession(
      pathRow.id,
      pathRow.levels[0].id,
      {
        slug: (formData.get("slug") as string) ?? "",
        title: (formData.get("title") as string) ?? "",
        type: (formData.get("type") as string) ?? "reading",
        description: (formData.get("description") as string) ?? "",
        body: (formData.get("body") as string) ?? "",
        sort_order: parseInt((formData.get("sort_order") as string) || "0", 10),
      }
    );
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
        New session: {path.title}
      </h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Level: {firstLevel.title}
      </p>
      <form action={submit} className="mt-6 max-w-xl space-y-4">
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Slug (URL, e.g. my-session)
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            placeholder="my-session"
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
          <label htmlFor="type" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Type
          </label>
          <select
            id="type"
            name="type"
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
            Create session
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
