/**
 * Phase-3: Fetch learning paths and sessions from Supabase.
 * Uses path slug and session slug for URLs; enrollments/session_completions use same slugs.
 */

import { createClient } from "@/lib/supabase/server";

export type SessionType = "reading" | "audio" | "practice" | "announcement";

export interface PathRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  introduction: string;
  sort_order: number;
}

export interface LevelRow {
  id: string;
  path_id: string;
  title: string;
  sort_order: number;
}

export interface SessionRow {
  id: string;
  path_id: string;
  level_id: string;
  slug: string;
  title: string;
  type: SessionType;
  description: string | null;
  body: string | null;
  sort_order: number;
}

export interface LearningPathWithLevels {
  id: string;
  slug: string;
  title: string;
  description: string;
  introduction: string;
  sort_order: number;
  levels: Array<{
    id: string;
    title: string;
    sort_order: number;
    sessions: Array<{
      id: string;
      slug: string;
      title: string;
      type: SessionType;
      description: string | null;
      body: string | null;
      sort_order: number;
    }>;
  }>;
}

/** Fetch all learning paths (for list and home preview). */
export async function getAllPaths(): Promise<PathRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("learning_paths")
    .select("id, slug, title, description, introduction, sort_order")
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []) as PathRow[];
}

/** Fetch one path by slug with levels and sessions (for path detail). */
export async function getPathBySlug(slug: string): Promise<LearningPathWithLevels | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: pathRow, error: pathError } = await supabase
    .from("learning_paths")
    .select("id, slug, title, description, introduction, sort_order")
    .eq("slug", slug)
    .single();
  if (pathError || !pathRow) return null;

  const { data: levels, error: levelsError } = await supabase
    .from("levels")
    .select("id, path_id, title, sort_order")
    .eq("path_id", pathRow.id)
    .order("sort_order", { ascending: true });
  if (levelsError || !levels?.length) {
    return {
      ...(pathRow as PathRow),
      levels: [],
    };
  }

  const levelIds = levels.map((l) => l.id);
  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("id, path_id, level_id, slug, title, type, description, body, sort_order")
    .in("level_id", levelIds)
    .order("sort_order", { ascending: true });
  if (sessionsError) {
    return {
      ...(pathRow as PathRow),
      levels: levels.map((l) => ({ ...l, sessions: [] })),
    };
  }

  const sessionsByLevel = new Map<string, SessionRow[]>();
  (sessions ?? []).forEach((s) => {
    const list = sessionsByLevel.get(s.level_id) ?? [];
    list.push(s as SessionRow);
    sessionsByLevel.set(s.level_id, list);
  });

  return {
    ...(pathRow as PathRow),
    levels: levels.map((l) => ({
      id: l.id,
      title: l.title,
      sort_order: l.sort_order,
      sessions: (sessionsByLevel.get(l.id) ?? []).map((s) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        type: s.type,
        description: s.description,
        body: s.body,
        sort_order: s.sort_order,
      })),
    })),
  };
}

/** Fetch one session by path slug and session slug (for session detail). */
export async function getSessionBySlugs(
  pathSlug: string,
  sessionSlug: string
): Promise<{ path: PathRow; level: LevelRow; session: SessionRow } | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: pathRow, error: pathError } = await supabase
    .from("learning_paths")
    .select("id, slug, title, description, introduction, sort_order")
    .eq("slug", pathSlug)
    .single();
  if (pathError || !pathRow) return null;

  const { data: sessionRow, error: sessionError } = await supabase
    .from("sessions")
    .select("id, path_id, level_id, slug, title, type, description, body, sort_order")
    .eq("path_id", pathRow.id)
    .eq("slug", sessionSlug)
    .single();
  if (sessionError || !sessionRow) return null;

  const { data: levelRow, error: levelError } = await supabase
    .from("levels")
    .select("id, path_id, title, sort_order")
    .eq("id", sessionRow.level_id)
    .single();
  if (levelError || !levelRow) return null;

  return {
    path: pathRow as PathRow,
    level: levelRow as LevelRow,
    session: sessionRow as SessionRow,
  };
}
