import Link from "next/link";
import { notFound } from "next/navigation";
import SessionProgress from "@/components/SessionProgress";
import { getPathBySlug, getSessionBySlugs } from "@/lib/data/paths";
import { getAnnouncementsForSession } from "@/lib/data/announcements";
import { createClient } from "@/lib/supabase/server";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id: pathSlug, sessionId: sessionSlug } = await params;
  const pathWithSession = await getSessionBySlugs(pathSlug, sessionSlug);
  if (!pathWithSession) notFound();

  const { path, level, session } = pathWithSession;
  const [pathWithLevels, announcements] = await Promise.all([
    getPathBySlug(pathSlug),
    getAnnouncementsForSession(pathSlug, sessionSlug),
  ]);
  const sessionsInLevel = pathWithLevels?.levels[0]?.sessions ?? [];
  const currentIndex = sessionsInLevel.findIndex((s) => s.slug === sessionSlug);
  const prevSession = currentIndex > 0 ? sessionsInLevel[currentIndex - 1] : null;
  const nextSession = currentIndex >= 0 && currentIndex < sessionsInLevel.length - 1 ? sessionsInLevel[currentIndex + 1] : null;

  const supabase = await createClient();
  let isCompleted = false;
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: completion } = await supabase
        .from("session_completions")
        .select("id")
        .eq("user_id", user.id)
        .eq("path_id", pathSlug)
        .eq("session_id", sessionSlug)
        .maybeSingle();
      isCompleted = !!completion;
    }
  }

  return (
    <main className="min-h-full px-6 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/paths/${pathSlug}`}
          className="text-sm font-medium text-deep-green/80 hover:text-deep-green transition-colors duration-200"
        >
          ← Back to {path.title}
        </Link>

        <div className="mt-6">
          <header className="mb-6 animate-fade-in">
            <p className="text-sm text-foreground/60">
              {level.title} · {session.type}
            </p>
            <h1 className="font-heading mt-1 text-2xl font-normal text-deep-green">
              {session.title}
            </h1>
            {session.description && (
              <p className="mt-2 text-foreground/80">
                {session.description}
              </p>
            )}
          </header>

          {announcements.length > 0 && (
            <section className="mb-6 space-y-3 animate-slide-up">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-green-soft bg-light-green/60 p-4"
                >
                  <p className="text-sm font-medium text-deep-green">
                    {a.title}
                  </p>
                  <p className="mt-1 text-sm text-foreground/85 whitespace-pre-wrap">
                    {a.body}
                  </p>
                </div>
              ))}
            </section>
          )}

          <section className="rounded-2xl border border-green-soft bg-[var(--background)] p-6 shadow-sm animate-slide-up">
            {session.body ? (
              <div className="prose prose-neutral max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {session.body}
              </div>
            ) : (
              <p className="text-foreground/60">
                Session content will appear here. Add a body in the sessions table to show content.
              </p>
            )}
          </section>

          {supabase && (
            <SessionProgress pathId={pathSlug} sessionId={sessionSlug} isCompleted={isCompleted} />
          )}

          <nav className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-light-green pt-6" aria-label="Session navigation">
            <div>
              {prevSession ? (
                <Link
                  href={`/paths/${pathSlug}/sessions/${prevSession.slug}`}
                  className="text-sm font-medium text-deep-green/80 hover:text-deep-green transition-colors duration-200"
                >
                  ← {prevSession.title}
                </Link>
              ) : (
                <span className="text-sm text-foreground/50">—</span>
              )}
            </div>
            <div>
              {nextSession ? (
                <Link
                  href={`/paths/${pathSlug}/sessions/${nextSession.slug}`}
                  className="text-sm font-medium text-deep-green/80 hover:text-deep-green transition-colors duration-200"
                >
                  {nextSession.title} →
                </Link>
              ) : (
                <Link
                  href={`/paths/${pathSlug}`}
                  className="text-sm font-medium text-deep-green/80 hover:text-deep-green transition-colors duration-200"
                >
                  Finish path →
                </Link>
              )}
            </div>
          </nav>

          <p className="mt-8 text-center text-sm text-foreground/60">
            <Link href="/contact" className="text-deep-green/80 hover:text-deep-green transition-colors duration-200">Contact</Link>
            {" · "}
            <Link href={`/questions?path=${encodeURIComponent(pathSlug)}&session=${encodeURIComponent(sessionSlug)}`} className="text-deep-green/80 hover:text-deep-green transition-colors duration-200">Ask a question</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
