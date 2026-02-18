import Link from "next/link";
import { redirect } from "next/navigation";
import { createPath } from "@/app/actions/admin-paths";

export default function AdminNewPathPage() {
  async function submit(formData: FormData) {
    "use server";
    const result = await createPath({
      slug: (formData.get("slug") as string) ?? "",
      title: (formData.get("title") as string) ?? "",
      description: (formData.get("description") as string) ?? "",
      introduction: (formData.get("introduction") as string) ?? "",
      sort_order: parseInt((formData.get("sort_order") as string) || "0", 10),
    });
    if (!result.error) redirect("/admin/paths");
  }

  return (
    <div>
      <Link
        href="/admin/paths"
        className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        ← Back to paths
      </Link>
      <h1 className="mt-4 text-2xl font-light text-neutral-800 dark:text-neutral-100">
        New path
      </h1>
      <form action={submit} className="mt-6 max-w-xl space-y-4">
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Slug (URL, e.g. my-path)
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            placeholder="my-path"
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
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Short description
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
        <div>
          <label htmlFor="introduction" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Introduction (full)
          </label>
          <textarea
            id="introduction"
            name="introduction"
            rows={4}
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
        <div>
          <label htmlFor="sort_order" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Sort order (number)
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
            Create path
          </button>
          <Link
            href="/admin/paths"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
