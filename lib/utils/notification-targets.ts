/**
 * Helpers to get user IDs for notification targets (admins, directors, etc.).
 * Uses service client to bypass RLS.
 */

import { createServiceClient } from "@/lib/supabase/server";

export async function getDirectorIds(): Promise<string[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .or("roles.cs.{director}");
  return (data ?? []).map((p) => (p as { id: string }).id).filter(Boolean);
}

export async function getAdminAndDirectorIds(): Promise<string[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .or("roles.cs.{admin},roles.cs.{director}");
  return (data ?? []).map((p) => (p as { id: string }).id).filter(Boolean);
}
