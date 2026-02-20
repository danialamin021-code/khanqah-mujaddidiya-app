/**
 * Push notification registration.
 * On login: request permission, get token, save to push_tokens.
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "./supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(userId: string): Promise<void> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  const platform = Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web";

  await supabase.from("push_tokens").upsert(
    { user_id: userId, device_token: token, platform },
    { onConflict: "user_id,device_token" }
  );
}
