import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuestionById } from "@/lib/data/questions";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const q = await getQuestionById(id);
  if (!q) notFound();

  return (
    <main className="min-h-full px-6 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/questions"
          className="text-sm font-medium text-deep-green/80 hover:text-deep-green transition-colors duration-200"
        >
          ← Back to my questions
        </Link>
        <h1 className="font-heading mt-4 text-2xl font-normal text-deep-green">
          {q.subject}
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          {q.status === "answered" ? "Answered" : "Open"}
          {q.path_slug && ` · ${q.path_slug}${q.session_slug ? ` / ${q.session_slug}` : ""}`}
        </p>

        <div className="mt-6 space-y-6">
          <section className="rounded-2xl border border-green-soft bg-light-green/40 p-5">
            <p className="text-sm font-medium text-deep-green/80">Your question</p>
            <p className="mt-2 whitespace-pre-wrap text-foreground/90">{q.body}</p>
          </section>
          {q.admin_response ? (
            <section className="rounded-2xl border border-green-soft bg-[var(--background)] p-5 shadow-sm">
              <p className="text-sm font-medium text-deep-green/80">Response</p>
              <p className="mt-2 whitespace-pre-wrap text-foreground/90">{q.admin_response}</p>
            </section>
          ) : (
            <p className="text-sm text-foreground/60">No response yet. You will see it here when available.</p>
          )}
        </div>
      </div>
    </main>
  );
}
