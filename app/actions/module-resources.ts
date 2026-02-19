"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAssignedModuleIds } from "@/lib/auth";

export async function createModuleResource(
  moduleId: string,
  data: { title: string; type: "pdf" | "link" | "file"; url: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const assigned = await getAssignedModuleIds();
  if (!assigned.includes(moduleId)) {
    return { success: false, error: "Not assigned to this module" };
  }

  const { error } = await supabase.from("module_resources").insert({
    module_id: moduleId,
    title: data.title.trim(),
    type: data.type,
    url: data.url.trim(),
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/teacher");
  return { success: true };
}

export async function deleteModuleResource(
  resourceId: string,
  moduleId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const assigned = await getAssignedModuleIds();
  if (!assigned.includes(moduleId)) {
    return { success: false, error: "Not assigned to this module" };
  }

  const { error } = await supabase
    .from("module_resources")
    .delete()
    .eq("id", resourceId)
    .eq("module_id", moduleId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/teacher");
  return { success: true };
}
