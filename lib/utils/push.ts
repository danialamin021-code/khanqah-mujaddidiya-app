/**
 * Mobile Push Notifications — Firebase Cloud Messaging (FCM) scaffold.
 *
 * Flow:
 * 1. When a notification is created in DB (via createNotification), optionally trigger push.
 * 2. Fetch push_tokens for the target user(s).
 * 3. Send via FCM API.
 * 4. Log success/failure.
 *
 * Setup:
 * - Add FIREBASE_SERVER_KEY or use Firebase Admin SDK with service account.
 * - Client: register device token via POST /api/push/register or server action.
 *
 * Role-filtered: Only send push for notifications the user is allowed to receive.
 */

import { createServiceClient } from "@/lib/supabase/server";
import { logPushFailure } from "./monitoring";

export interface PushPayload {
  title: string;
  body?: string;
  data?: Record<string, string>;
}

/**
 * Send push notification to a user's devices.
 * Fetches push_tokens, sends via FCM, logs result.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const supabase = createServiceClient();
  if (!supabase) return { sent: 0, failed: 0 };

  const { data: tokens } = await supabase
    .from("push_tokens")
    .select("id, device_token, platform")
    .eq("user_id", userId);

  if (!tokens?.length) return { sent: 0, failed: 0 };

  const serverKey = process.env.FIREBASE_SERVER_KEY?.trim();
  if (!serverKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[push] FIREBASE_SERVER_KEY not set — push skipped");
    }
    return { sent: 0, failed: tokens.length };
  }

  let sent = 0;
  let failed = 0;

  for (const t of tokens) {
    try {
      const res = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${serverKey}`,
        },
        body: JSON.stringify({
          to: t.device_token,
          notification: {
            title: payload.title,
            body: payload.body ?? "",
          },
          data: payload.data ?? {},
        }),
      });
      if (res.ok) sent++;
      else {
        failed++;
        logPushFailure(userId, t.id, `HTTP ${res.status}`);
      }
    } catch (e) {
      failed++;
      logPushFailure(userId, t.id, String(e));
    }
  }

  return { sent, failed };
}

/**
 * Register a device token for push notifications.
 * Call from client after FCM registration.
 */
export async function registerPushToken(
  userId: string,
  deviceToken: string,
  platform: "ios" | "android" | "web"
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { error } = await supabase.from("push_tokens").insert({
    user_id: userId,
    device_token: deviceToken,
    platform,
  });

  if (error) {
    if (error.code === "23505") return { success: true }; // duplicate
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Delete all push tokens for a user (call on logout).
 * Ensures tokens are removed when user signs out.
 */
export async function deletePushTokensForUser(userId: string): Promise<void> {
  const supabase = createServiceClient();
  if (!supabase) return;
  await supabase.from("push_tokens").delete().eq("user_id", userId);
}
