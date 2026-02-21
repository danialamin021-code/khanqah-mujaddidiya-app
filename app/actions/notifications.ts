"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/utils/notifications";
import { getDirectorIds, getAdminAndDirectorIds } from "@/lib/utils/notification-targets";
import {
  getNotificationsForUser,
  getUnreadNotificationCount,
  type NotificationRow,
} from "@/lib/data/notifications";

export type { NotificationRow };

export async function getNotifications(
  page = 1
): Promise<{ notifications: NotificationRow[]; totalCount: number }> {
  return getNotificationsForUser(page);
}

export async function getUnreadCount(): Promise<number> {
  return getUnreadNotificationCount();
}

export async function markNotificationRead(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllNotificationsRead(): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) return { success: false, error: error.message };
  revalidatePath("/notifications");
  return { success: true };
}

/**
 * Notify admins/directors when a user requests Teacher or Admin role.
 * Call from signup flow after profile.role_request is set.
 */
export async function notifyRoleRequest(
  role: "teacher" | "admin",
  email: string
): Promise<void> {
  const roleLabel = role === "teacher" ? "Teacher" : "Admin";
  const title = `New ${roleLabel} role request`;
  const body = `${email} has requested the ${roleLabel} role. Review in Admin → Approvals.`;

  if (role === "admin") {
    const directorIds = await getDirectorIds();
    await Promise.all(
      directorIds.map((uid) =>
        createNotification({
          userId: uid,
          type: "admin_request",
          title,
          body,
          metadata: { requestType: "admin", email },
        })
      )
    );
  } else {
    const adminIds = await getAdminAndDirectorIds();
    await Promise.all(
      adminIds.map((uid) =>
        createNotification({
          userId: uid,
          type: "teacher_request",
          title,
          body,
          metadata: { requestType: "teacher", email },
        })
      )
    );
  }
}
