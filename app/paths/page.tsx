import Link from "next/link";
import { getAllPaths } from "@/lib/data/paths";

export default async function PathsPage() {
  const paths = await getAllPaths();
  return (
    <main className="min-h-full px-6 py-8 md:py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          Learning paths
        </h1>
        <p className="mt-2 text-foreground/80">
          Structured paths with guided sessions. Choose a path to begin.
        </p>
        {paths.length === 0 ? (
          <p className="mt-10 text-foreground/60">
            No paths yet. Run the Phase-3 migration in Supabase SQL Editor to seed paths and sessions.
          </p>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger">
            {paths.map((path) => (
              <li key={path.slug} className="animate-slide-up">
                <Link
                  href={`/paths/${path.slug}`}
                  className="flex h-full flex-col rounded-2xl border border-green-soft bg-light-green/50 p-5 shadow-sm transition-colors duration-200 hover:border-deep-green/20 hover:bg-light-green"
                >
                  <h2 className="font-heading text-lg font-normal text-deep-green">
                    {path.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-foreground/75 line-clamp-2">
                    {path.description}
                  </p>
                  <span className="mt-4 inline-block rounded-lg border border-deep-green/40 px-3 py-2 text-center text-sm font-medium text-deep-green transition-colors duration-200 hover:bg-deep-green/10">
                    View Module
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
