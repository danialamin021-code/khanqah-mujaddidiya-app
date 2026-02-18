import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyQuestions } from "@/lib/data/questions";
import { submitQuestion } from "@/app/actions/questions";

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ path?: string; session?: string }>;
}) {
  const supabase = await createClient();
  const { path: pathSlug, session: sessionSlug } = await searchParams;
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const questions = user ? await getMyQuestions() : [];

  async function submit(formData: FormData) {
    "use server";
    const result = await submitQuestion({
      subject: (formData.get("subject") as string) ?? "",
      body: (formData.get("body") as string) ?? "",
      path_slug: (formData.get("path_slug") as string)?.trim() || null,
      session_slug: (formData.get("session_slug") as string)?.trim() || null,
    });
    if (!result.error) redirect("/questions");
  }

  return (
    <main className="min-h-full px-6 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          My questions
        </h1>
        <p className="mt-2 text-foreground/80">
          Private questions. Only you and admins see them. Responses appear in each question.
        </p>

        {!user ? (
          <div className="mt-8 rounded-2xl border border-green-soft bg-light-green/40 p-6 animate-slide-up">
            <p className="text-foreground/80">
              Log in to submit and view your questions.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-gold-hover"
            >
              Log in
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8">
              <Link
                href="#ask"
                className="inline-block rounded-lg bg-muted-gold px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-gold-hover"
              >
                Ask a question
              </Link>
            </div>

            <h2 className="font-heading mt-10 text-lg font-normal text-deep-green">
              Previous questions
            </h2>
            {questions.length === 0 ? (
              <p className="mt-2 text-foreground/60">
                No questions yet. Use the button above to ask.
              </p>
            ) : (
              <ul className="mt-4 space-y-2 stagger">
                {questions.map((q) => (
                  <li key={q.id}>
                    <Link
                      href={`/questions/${q.id}`}
                      className="block rounded-xl border border-green-soft/80 bg-[var(--background)] px-4 py-3 transition-colors duration-200 hover:bg-light-green/40"
                    >
                      <span className="font-medium text-deep-green">{q.subject}</span>
                      <span className="ml-2 text-sm text-foreground/60">{q.status === "answered" ? "Answered" : "Open"}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <section id="ask" className="mt-12 rounded-2xl border border-green-soft bg-light-green/40 p-6 animate-slide-up">
              <h2 className="font-heading text-lg font-normal text-deep-green">
                New question
              </h2>
              <form action={submit} className="mt-4 space-y-4">
                <input type="hidden" name="path_slug" value={pathSlug ?? ""} />
                <input type="hidden" name="session_slug" value={sessionSlug ?? ""} />
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-deep-green/90">
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground placeholder-foreground/50 focus:border-deep-green/40 focus:outline-none focus:ring-1 focus:ring-deep-green/30"
                    placeholder="Brief subject"
                  />
                </div>
                <div>
                  <label htmlFor="body" className="block text-sm font-medium text-deep-green/90">
                    Your question
                  </label>
                  <textarea
                    id="body"
                    name="body"
                    rows={4}
                    required
                    className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground placeholder-foreground/50 focus:border-deep-green/40 focus:outline-none focus:ring-1 focus:ring-deep-green/30"
                    placeholder="Write your question…"
                  />
                </div>
                {(pathSlug || sessionSlug) && (
                  <p className="text-sm text-foreground/60">
                    Context: {pathSlug}{sessionSlug ? ` / ${sessionSlug}` : ""}
                  </p>
                )}
                <button
                  type="submit"
                  className="rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-gold-hover"
                >
                  Submit question
                </button>
              </form>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
