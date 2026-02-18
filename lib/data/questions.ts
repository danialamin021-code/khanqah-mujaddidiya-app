/**
 * Phase-5: Private student questions. RLS ensures students see only their own.
 */

import { createClient } from "@/lib/supabase/server";

export interface QuestionRow {
  id: string;
  user_id: string;
  path_slug: string | null;
  session_slug: string | null;
  subject: string;
  body: string;
  status: "open" | "answered";
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Get current user's questions (RLS: only own rows). Returns [] if not logged in. */
export async function getMyQuestions(): Promise<QuestionRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("student_questions")
    .select("id, user_id, path_slug, session_slug, subject, body, status, admin_response, responded_at, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as QuestionRow[];
}

/** Get one question by id. RLS: user sees only own; returns null if not found or not own. */
export async function getQuestionById(id: string): Promise<QuestionRow | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("student_questions")
    .select("id, user_id, path_slug, session_slug, subject, body, status, admin_response, responded_at, created_at, updated_at")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as QuestionRow;
}

/** Get all questions (admin only; RLS allows admin to select all). */
export async function getAllQuestions(): Promise<QuestionRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("student_questions")
    .select("id, user_id, path_slug, session_slug, subject, body, status, admin_response, responded_at, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as QuestionRow[];
}
