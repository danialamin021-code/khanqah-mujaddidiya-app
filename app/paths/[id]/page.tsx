import Link from "next/link";
import { notFound } from "next/navigation";
import EnrollButton from "@/components/EnrollButton";
import { getPathBySlug } from "@/lib/data/paths";
import { createClient } from "@/lib/supabase/server";

export default async function PathDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: pathSlug } = await params;
  const path = await getPathBySlug(pathSlug);
  if (!path) notFound();

  const supabase = await createClient();
  let isLoggedIn = false;
  let isEnrolled = false;
  let lastVisitedSessionSlug: string | null = null;
  const completedSessionSlugs = new Set<string>();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      isLoggedIn = true;
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id, last_visited_session_id")
        .eq("user_id", user.id)
        .eq("path_id", pathSlug)
        .maybeSingle();
      isEnrolled = !!enrollment;
      lastVisitedSessionSlug = enrollment?.last_visited_session_id ?? null;
      const { data: completions } = await supabase
        .from("session_completions")
        .select("session_id")
        .eq("user_id", user.id)
        .eq("path_id", pathSlug);
      completions?.forEach((c) => completedSessionSlugs.add(c.session_id));
    }
  }

  const firstLevel = path.levels[0];
  const sessions = firstLevel?.sessions ?? [];
  const lastVisitedSession = lastVisitedSessionSlug
    ? sessions.find((s) => s.slug === lastVisitedSessionSlug)
    : null;

  return (
    <main className="min-h-full px-6 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/paths"
          className="text-sm font-medium text-deep-green/80 hover:text-deep-green transition-colors duration-200"
        >
          ← Back to paths
        </Link>
        <h1 className="font-heading mt-4 text-2xl font-normal text-deep-green">
          {path.title}
        </h1>
        <p className="mt-2 text-foreground/80">
          {path.description}
        </p>

        <section className="mt-8 rounded-2xl border border-green-soft bg-light-green/50 p-6 shadow-sm animate-slide-up">
          <h2 className="font-heading text-sm font-normal text-deep-green">
            Introduction
          </h2>
          <p className="mt-3 text-foreground/90 leading-relaxed">
            {path.introduction}
          </p>
        </section>

        {lastVisitedSession && isLoggedIn && (
          <div className="mt-8">
            <Link
              href={`/paths/${path.slug}/sessions/${lastVisitedSession.slug}`}
              className="inline-block rounded-lg bg-muted-gold px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-gold-hover"
            >
              Continue from: {lastVisitedSession.title} →
            </Link>
          </div>
        )}

        <section className="mt-8">
          <h2 className="font-heading text-sm font-normal text-deep-green">
            {firstLevel?.title ?? "Sessions"}
          </h2>
          <ul className="mt-4 space-y-2">
            {sessions.map((session, index) => (
              <li key={session.slug}>
                <Link
                  href={`/paths/${path.slug}/sessions/${session.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-green-soft/80 bg-[var(--background)] px-4 py-3 text-left transition-colors duration-200 hover:bg-light-green/40"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-light-green text-sm font-medium text-deep-green">
                    {completedSessionSlugs.has(session.slug) ? "✓" : index + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="font-medium text-deep-green">
                      {session.title}
                    </span>
                    {session.description && (
                      <span className="ml-2 text-sm text-foreground/60">
                        — {session.description}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {!supabase ? (
          <p className="mt-10 text-sm text-foreground/60">
            Configure Supabase in .env.local to enable enrollment.
          </p>
        ) : !isLoggedIn ? (
          <p className="mt-10 text-sm text-foreground/60">
            <Link href="/login" className="font-medium text-deep-green hover:underline">
              Log in
            </Link>{" "}
            to enroll and save progress.
          </p>
        ) : (
          <EnrollButton pathId={pathSlug} isEnrolled={isEnrolled} />
        )}
      </div>
    </main>
  );
}
