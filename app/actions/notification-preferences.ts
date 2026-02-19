"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getNotificationPreferences(): Promise<{
  notifyAnnouncements: boolean;
  notifyEvents: boolean;
} | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("notify_announcements, notify_events")
    .eq("id", user.id)
    .single();

  if (!data) return { notifyAnnouncements: true, notifyEvents: true };
  return {
    notifyAnnouncements: (data as { notify_announcements: boolean }).notify_announcements ?? true,
    notifyEvents: (data as { notify_events: boolean }).notify_events ?? true,
  };
}

export async function updateNotificationPreferences(prefs: {
  notifyAnnouncements?: boolean;
  notifyEvents?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const updates: Record<string, boolean> = {};
  if (prefs.notifyAnnouncements !== undefined) updates.notify_announcements = prefs.notifyAnnouncements;
  if (prefs.notifyEvents !== undefined) updates.notify_events = prefs.notifyEvents;
  if (Object.keys(updates).length === 0) return { success: true };

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/settings");
  revalidatePath("/profile");
  return { success: true };
}
