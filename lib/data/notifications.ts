/**
 * Notification data access — fetch and update user notifications.
 */

import { createClient } from "@/lib/supabase/server";

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string | null;
  body: string | null;
  read_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

const PAGE_SIZE = 30;

/**
 * Get notifications for the current user, newest first.
 */
export async function getNotificationsForUser(
  page = 1
): Promise<{ notifications: NotificationRow[]; totalCount: number }> {
  const supabase = await createClient();
  if (!supabase) return { notifications: [], totalCount: 0 };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { notifications: [], totalCount: 0 };

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: notifications, count: totalCount, error } = await supabase
    .from("notifications")
    .select("id, user_id, type, title, body, read_at, metadata, created_at", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return { notifications: [], totalCount: 0 };

  return {
    notifications: (notifications ?? []) as NotificationRow[],
    totalCount: totalCount ?? 0,
  };
}

/**
 * Get unread notification count for the current user.
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return 0;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) return 0;
  return count ?? 0;
}
