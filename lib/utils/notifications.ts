/**
 * In-platform notification types. Creation moved to notification-engine Edge Function.
 * @deprecated createNotification/createNotificationsForUsers — use Edge Function.
 */


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
 * @deprecated All notification creation moved to notification-engine Edge Function.
 * Use invokeNotificationEngine or invokeNotificationEngineCreateRoleRequest.
 * Direct DB inserts from Next.js are prohibited.
 */
export async function createNotification(_params: CreateNotificationParams): Promise<string | null> {
  throw new Error("createNotification is deprecated. Use notification-engine Edge Function.");
}

/**
 * @deprecated Use notification-engine Edge Function.
 */
export async function createNotificationsForUsers(
  _userIds: string[],
  _params: Omit<CreateNotificationParams, "userId">
): Promise<void> {
  throw new Error("createNotificationsForUsers is deprecated. Use notification-engine Edge Function.");
}
