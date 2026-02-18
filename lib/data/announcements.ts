/**
 * Phase-5: Live announcements (admin-created, student read-only).
 * Fetched by scope: global, path-level, or session-level.
 */

import { createClient } from "@/lib/supabase/server";

export interface AnnouncementRow {
  id: string;
  path_id: string | null;
  session_id: string | null;
  title: string;
  body: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Get announcements relevant to a session: session-level, then path-level, then global. */
export async function getAnnouncementsForSession(
  pathSlug: string,
  sessionSlug: string
): Promise<AnnouncementRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: pathRow } = await supabase
    .from("learning_paths")
    .select("id")
    .eq("slug", pathSlug)
    .single();
  if (!pathRow) return [];

  const { data: sessionRow } = await supabase
    .from("sessions")
    .select("id")
    .eq("path_id", pathRow.id)
    .eq("slug", sessionSlug)
    .single();
  const pathId = pathRow.id;
  const sessionId = sessionRow?.id ?? null;

  const { data: rows, error } = await supabase
    .from("live_announcements")
    .select("id, path_id, session_id, title, body, sort_order, created_at, updated_at")
    .or(`path_id.is.null,path_id.eq.${pathId}`);

  if (error) return [];
  const list = (rows ?? []) as AnnouncementRow[];

  // Keep only: global (path_id null), path-level (path_id set, session_id null), or session-level (path_id set, session_id set)
  const filtered = list.filter(
    (r) =>
      r.path_id == null ||
      (r.path_id === pathId && (r.session_id == null || r.session_id === sessionId))
  );

  // Order: session > path > global; then sort_order asc, created_at desc
  const sessionList = filtered.filter((r) => r.session_id != null);
  const pathList = filtered.filter((r) => r.path_id != null && r.session_id == null);
  const globalList = filtered.filter((r) => r.path_id == null && r.session_id == null);
  const ordered = [...sessionList, ...pathList, ...globalList];
  ordered.sort((a, b) => a.sort_order - b.sort_order || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return ordered;
}

/** Get all announcements (admin list). */
export async function getAllAnnouncements(): Promise<AnnouncementRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("live_announcements")
    .select("id, path_id, session_id, title, body, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as AnnouncementRow[];
}

/** Get one announcement by id (admin edit). */
export async function getAnnouncementById(id: string): Promise<AnnouncementRow | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("live_announcements")
    .select("id, path_id, session_id, title, body, sort_order, created_at, updated_at")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as AnnouncementRow;
}
