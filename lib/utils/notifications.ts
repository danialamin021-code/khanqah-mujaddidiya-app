/**
 * In-platform notifications. Uses service client to bypass RLS.
 * Call only from trusted server actions.
 */

import { createServiceClient } from "@/lib/supabase/server";

export type NotificationType =
  // Student
  | "batch_enrollment"
  | "attendance_below_threshold"
  | "batch_completion"
  | "batch_session_reminder"
  | "module_announcement"
  | "session_scheduled"
  | "module_update"
  // Teacher
  | "module_assignment"
  | "batch_assignment"
  | "new_enrollment"
  | "faq_submitted"
  | "attendance_alert"
  // Admin
  | "enrollment_new"
  | "teacher_request"
  | "teacher_assignment"
  | "announcement_published"
  // Director
  | "bayat_request"
  | "admin_request"
  | "teacher_request_director"
  | "platform_alert";

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a notification for a user. Uses service client.
 */
export async function createNotification(params: CreateNotificationParams): Promise<string | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      body: params.body ?? null,
      metadata: params.metadata ?? {},
    })
    .select("id")
    .single();

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[notifications] createNotification error:", error);
    }
    return null;
  }
  return data?.id ?? null;
}

/**
 * Create notifications for multiple users.
 */
export async function createNotificationsForUsers(
  userIds: string[],
  params: Omit<CreateNotificationParams, "userId">
): Promise<void> {
  await Promise.all(
    userIds.map((userId) =>
      createNotification({
        ...params,
        userId,
      })
    )
  );
}
