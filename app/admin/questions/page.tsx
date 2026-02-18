import Link from "next/link";
import { getAllQuestions } from "@/lib/data/questions";

export default async function AdminQuestionsPage() {
  const questions = await getAllQuestions();

  return (
    <div>
      <h1 className="text-2xl font-light text-neutral-800 dark:text-neutral-100">
        Student questions
      </h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Private Q&A. Students see only their own; respond here to answer.
      </p>
      {questions.length === 0 ? (
        <p className="mt-8 text-neutral-500 dark:text-neutral-400">
          No questions yet.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {questions.map((q) => (
            <li
              key={q.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {q.subject}
                  </span>
                  <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                    {q.status === "answered" ? "Answered" : "Open"} · user {q.user_id.slice(0, 8)}…
                  </span>
                  {q.path_slug && (
                    <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                      · {q.path_slug}
                      {q.session_slug ? ` / ${q.session_slug}` : ""}
                    </span>
                  )}
                  <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                    {q.body}
                  </p>
                  {q.admin_response && (
                    <div className="mt-3 rounded border border-neutral-200 bg-neutral-50 p-3 text-sm dark:border-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-300">
                      <span className="font-medium text-neutral-600 dark:text-neutral-400">Response:</span>
                      <p className="mt-1 whitespace-pre-wrap">{q.admin_response}</p>
                    </div>
                  )}
                </div>
                <Link
                  href={`/admin/questions/${q.id}`}
                  className="shrink-0 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {q.admin_response ? "Edit response" : "Respond"}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
