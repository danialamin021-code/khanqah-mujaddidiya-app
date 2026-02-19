"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function createPlatformEvent(data: {
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  location?: string;
  url?: string;
}): Promise<{ success: boolean; error?: string }> {
  const canAccess = await requireAdmin();
  if (!canAccess) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { error } = await supabase.from("platform_events").insert({
    title: data.title,
    description: data.description || null,
    event_date: data.event_date,
    event_time: data.event_time || null,
    location: data.location || null,
    url: data.url || null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/events");
  return { success: true };
}

export async function updatePlatformEvent(
  id: string,
  data: {
    title: string;
    description?: string;
    event_date: string;
    event_time?: string;
    location?: string;
    url?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const canAccess = await requireAdmin();
  if (!canAccess) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { error } = await supabase
    .from("platform_events")
    .update({
      title: data.title,
      description: data.description || null,
      event_date: data.event_date,
      event_time: data.event_time || null,
      location: data.location || null,
      url: data.url || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/events");
  return { success: true };
}
