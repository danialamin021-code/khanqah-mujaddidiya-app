"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface ModuleSessionRow {
  id: string;
  module_id: string;
  date: string;
  time: string | null;
  zoom_link: string | null;
  topic: string | null;
  status: "scheduled" | "live" | "completed";
  updated_at: string;
}

export interface ModuleAnnouncementRow {
  id: string;
  module_id: string;
  title: string;
  content: string;
  updated_at: string;
}

export interface ModuleAttendanceRow {
  id: string;
  session_id: string;
  user_id: string;
  status: "present" | "absent";
}

export interface RealtimeModuleState {
  sessions: ModuleSessionRow[];
  announcements: ModuleAnnouncementRow[];
  attendance: ModuleAttendanceRow[];
}

/**
 * Selective real-time subscription for a single module.
 * Subscribes to: sessions, announcements, attendance (for current user).
 * Only scoped to module_id. Unsubscribes on unmount.
 */
export function useRealtimeModule(
  moduleId: string | null,
  userId: string | null
) {
  const [state, setState] = useState<RealtimeModuleState>({
    sessions: [],
    announcements: [],
    attendance: [],
  });

  const fetchInitial = useCallback(async () => {
    const supabase = createClient();
    if (!supabase || !moduleId) return;

    const [sessionsRes, announcementsRes, attendanceRes] = await Promise.all([
      supabase
        .from("module_sessions")
        .select("id, module_id, date, time, zoom_link, topic, status, updated_at")
        .eq("module_id", moduleId)
        .eq("is_archived", false)
        .order("date", { ascending: true }),
      supabase
        .from("module_announcements")
        .select("id, module_id, title, content, updated_at")
        .eq("module_id", moduleId)
        .order("updated_at", { ascending: false }),
      (async () => {
        if (!userId) return { data: [] };
        const { data: sessionIds } = await supabase
          .from("module_sessions")
          .select("id")
          .eq("module_id", moduleId)
          .eq("is_archived", false);
        const ids = (sessionIds ?? []).map((s) => s.id);
        if (ids.length === 0) return { data: [] };
        return supabase
          .from("module_attendance")
          .select("id, session_id, user_id, status")
          .eq("user_id", userId)
          .in("session_id", ids);
      })(),
    ]);

    setState({
      sessions: (sessionsRes.data ?? []) as ModuleSessionRow[],
      announcements: (announcementsRes.data ?? []) as ModuleAnnouncementRow[],
      attendance: (attendanceRes.data ?? []) as ModuleAttendanceRow[],
    });
  }, [moduleId, userId]);

  useEffect(() => {
    if (!moduleId) return;

    queueMicrotask(() => fetchInitial());

    const supabase = createClient();
    if (!supabase) return;

    const ch = supabase
      .channel(`module:${moduleId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "module_sessions", filter: `module_id=eq.${moduleId}` },
        () => fetchInitial()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "module_announcements", filter: `module_id=eq.${moduleId}` },
        () => fetchInitial()
      );
    if (userId) {
      ch.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "module_attendance", filter: `user_id=eq.${userId}` },
        () => fetchInitial()
      );
    }
    ch.subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [moduleId, userId, fetchInitial]);

  return state;
}
