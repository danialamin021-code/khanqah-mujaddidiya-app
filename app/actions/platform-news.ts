"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function createPlatformNews(data: {
  title: string;
  excerpt: string;
  body: string;
}): Promise<{ success: boolean; error?: string }> {
  const canAccess = await requireAdmin();
  if (!canAccess) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { error } = await supabase.from("platform_news").insert({
    title: data.title,
    excerpt: data.excerpt,
    body: data.body,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/home");
  revalidatePath("/news");
  return { success: true };
}

export async function updatePlatformNews(
  id: string,
  data: { title: string; excerpt: string; body: string }
): Promise<{ success: boolean; error?: string }> {
  const canAccess = await requireAdmin();
  if (!canAccess) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { error } = await supabase
    .from("platform_news")
    .update({ title: data.title, excerpt: data.excerpt, body: data.body })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/home");
  revalidatePath("/news");
  return { success: true };
}
