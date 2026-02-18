import Link from "next/link";
import { notFound } from "next/navigation";
import { getPathBySlug } from "@/lib/data/paths";

export default async function AdminPathSessionsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const path = await getPathBySlug(slug);
  if (!path) notFound();

  const sessions = path.levels.flatMap((l) =>
    l.sessions.map((s) => ({ ...s, levelTitle: l.title }))
  );

  return (
    <div>
      <Link
        href="/admin/paths"
        className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        ← Back to paths
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-light text-neutral-800 dark:text-neutral-100">
          Sessions: {path.title}
        </h1>
        <Link
          href={`/admin/paths/${slug}/sessions/new`}
          className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          New session
        </Link>
      </div>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Path slug: /{path.slug}. Sessions use this path and a level.
      </p>
      {sessions.length === 0 ? (
        <p className="mt-8 text-neutral-500 dark:text-neutral-400">
          No sessions yet. Create one to get started.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {sessions.map((session) => (
            <li
              key={session.slug}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/50"
            >
              <div>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {session.title}
                </span>
                <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                  /{session.slug} · {session.levelTitle} · {session.type}
                </span>
              </div>
              <Link
                href={`/admin/paths/${slug}/sessions/${session.slug}/edit`}
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
