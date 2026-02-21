"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { invokeNotificationEngine, invokeNotificationEngineCreateRoleRequest } from "@/lib/utils/invoke-edge-function";
import {
  getNotificationsForUser,
  getUnreadNotificationCount,
} from "@/lib/data/notifications";

export async function getNotifications(
  page = 1
): Promise<{ notifications: Awaited<ReturnType<typeof getNotificationsForUser>>["notifications"]; totalCount: number }> {
  return getNotificationsForUser(page);
}

export async function getUnreadCount(): Promise<number> {
  return getUnreadNotificationCount();
}

/**
 * Mark a notification as read. Uses notification-engine Edge Function.
 */
export async function markNotificationRead(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { success: false, error: "Not authenticated" };

  const result = await invokeNotificationEngine(session.access_token, "markRead", { notificationId });
  if (result.success) revalidatePath("/notifications");
  return result;
}

/**
 * Mark all notifications as read. Uses notification-engine Edge Function.
 */
export async function markAllNotificationsRead(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { success: false, error: "Not authenticated" };

  const result = await invokeNotificationEngine(session.access_token, "bulkMarkRead", {});
  if (result.success) revalidatePath("/notifications");
  return result;
}

/**
 * Notify admins/directors when a user requests Teacher or Admin role.
 * Call from signup flow after profile.role_request is set.
 * Uses notification-engine Edge Function (internal secret).
 */
export async function notifyRoleRequest(
  role: "teacher" | "admin",
  email: string
): Promise<void> {
  await invokeNotificationEngineCreateRoleRequest(role, email);
}
