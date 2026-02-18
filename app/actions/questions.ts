"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

/** Student submits a question (private). RLS: insert with user_id = auth.uid(). */
export async function submitQuestion(formData: {
  subject: string;
  body: string;
  path_slug?: string | null;
  session_slug?: string | null;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured." };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to submit a question." };

  const { error } = await supabase.from("student_questions").insert({
    user_id: user.id,
    subject: formData.subject.trim(),
    body: formData.body.trim() || "",
    path_slug: formData.path_slug?.trim() || null,
    session_slug: formData.session_slug?.trim() || null,
    status: "open",
  });
  if (error) return { error: error.message };
  revalidatePath("/questions");
  return {};
}

/** Admin responds to a question. RLS: only admin can update. */
export async function respondToQuestion(
  questionId: string,
  formData: { admin_response: string; status: "open" | "answered" }
): Promise<{ error?: string }> {
  if (!(await requireAdmin())) return { error: "Forbidden." };
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured." };
  const { error } = await supabase
    .from("student_questions")
    .update({
      admin_response: formData.admin_response.trim() || null,
      status: formData.status,
      responded_at: formData.status === "answered" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", questionId);
  if (error) return { error: error.message };
  revalidatePath("/admin/questions");
  revalidatePath("/questions");
  return {};
}
