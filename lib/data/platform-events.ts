import { createClient } from "@/lib/supabase/server";

export interface PlatformEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  url: string | null;
}

export async function getUpcomingEvents(limit = 20): Promise<PlatformEvent[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("platform_events")
    .select("id, title, description, event_date, event_time, location, url")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(limit);

  return (data ?? []) as PlatformEvent[];
}
