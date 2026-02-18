import Link from "next/link";
import { getAllPaths } from "@/lib/data/paths";

export default async function AdminPathsPage() {
  const paths = await getAllPaths();
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          Learning paths
        </h1>
        <Link
          href="/admin/paths/new"
          className="rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
        >
          New path
        </Link>
      </div>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Create and edit paths. Students see these on the app.
      </p>
      {paths.length === 0 ? (
        <p className="mt-8 text-neutral-500 dark:text-neutral-400">
          No paths yet. Create one to get started.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {paths.map((path) => (
            <li
              key={path.slug}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/50"
            >
              <div>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {path.title}
                </span>
                <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                  /{path.slug}
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/paths/${path.slug}/sessions`}
                  className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  Sessions
                </Link>
                <Link
                  href={`/admin/paths/${path.slug}/edit`}
                  className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
