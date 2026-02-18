/**
 * Module data — fetch from DB. Slug is display-only; id is source of truth.
 */

import { createClient } from "@/lib/supabase/server";

export interface ModuleRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
}

export async function getModuleById(id: string): Promise<ModuleRow | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("modules")
    .select("id, slug, title, description, sort_order")
    .eq("id", id)
    .eq("is_archived", false)
    .single();
  return data as ModuleRow | null;
}

export async function getModuleBySlug(slug: string): Promise<ModuleRow | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("modules")
    .select("id, slug, title, description, sort_order")
    .eq("slug", slug)
    .eq("is_archived", false)
    .single();
  return data as ModuleRow | null;
}

export async function getAllModules(): Promise<ModuleRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("modules")
    .select("id, slug, title, description, sort_order")
    .eq("is_archived", false)
    .order("sort_order");
  return (data ?? []) as ModuleRow[];
}

export interface TeacherForModule {
  id: string;
  fullName: string;
  email?: string;
}

/** Teachers assigned to a module. For display on module page (student view). */
export async function getTeachersForModule(moduleId: string): Promise<TeacherForModule[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data: assignments, error } = await supabase
    .from("module_teachers")
    .select("user_id")
    .eq("module_id", moduleId);
  if (error || !assignments?.length) return [];

  const userIds = assignments.map((a) => a.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds);

  return (profiles ?? []).map((p) => ({
    id: (p as { id: string }).id,
    fullName: (p as { full_name?: string }).full_name ?? (p as { email?: string }).email ?? "Teacher",
    email: (p as { email?: string }).email,
  })) as TeacherForModule[];
}

/** Modules assigned to a teacher. Returns empty if not teacher or table missing. */
export async function getAssignedModulesForUser(userId: string): Promise<ModuleRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data: assignments, error } = await supabase
    .from("module_teachers")
    .select("module_id")
    .eq("user_id", userId);
  if (error || !assignments?.length) return [];

  const ids = assignments.map((a) => a.module_id);
  const { data: mods } = await supabase
    .from("modules")
    .select("id, slug, title, description, sort_order")
    .in("id", ids)
    .eq("is_archived", false)
    .order("sort_order");
  return (mods ?? []) as ModuleRow[];
}
