import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { respondToQuestion } from "@/app/actions/questions";

export default async function AdminQuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin();
  const supabase = await createClient();
  if (!supabase) notFound();
  const { data: q, error } = await supabase
    .from("student_questions")
    .select("id, user_id, path_slug, session_slug, subject, body, status, admin_response, responded_at, created_at, updated_at")
    .eq("id", id)
    .single();
  if (error || !q) notFound();

  async function submit(formData: FormData) {
    "use server";
    const result = await respondToQuestion(id, {
      admin_response: (formData.get("admin_response") as string) ?? "",
      status: (formData.get("status") as "open" | "answered") ?? "answered",
    });
    if (!result.error) redirect("/admin/questions");
  }

  return (
    <div>
      <Link
        href="/admin/questions"
        className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        ← Back to questions
      </Link>
      <h1 className="mt-4 text-2xl font-light text-neutral-800 dark:text-neutral-100">
        {q.subject}
      </h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        From user {q.user_id} · {q.status}
        {q.path_slug && ` · ${q.path_slug}${q.session_slug ? ` / ${q.session_slug}` : ""}`}
      </p>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Question</p>
        <p className="mt-2 whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">{q.body}</p>
      </div>

      <form action={submit} className="mt-8 max-w-xl space-y-4">
        <div>
          <label htmlFor="admin_response" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Your response
          </label>
          <textarea
            id="admin_response"
            name="admin_response"
            rows={6}
            defaultValue={q.admin_response ?? ""}
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            placeholder="Write your response to the student…"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={q.status}
            className="mt-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          >
            <option value="open">Open</option>
            <option value="answered">Answered</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            Save response
          </button>
          <Link
            href="/admin/questions"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
