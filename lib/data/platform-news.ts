import { createClient } from "@/lib/supabase/server";

export interface PlatformNewsItem {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  published_at: string;
  sort_order: number;
}

export async function getPlatformNews(limit = 20): Promise<PlatformNewsItem[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("platform_news")
    .select("id, title, excerpt, body, published_at, sort_order")
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as PlatformNewsItem[];
}

export async function getPlatformNewsById(id: string): Promise<PlatformNewsItem | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("platform_news")
    .select("id, title, excerpt, body, published_at, sort_order")
    .eq("id", id)
    .single();

  return data as PlatformNewsItem | null;
}
