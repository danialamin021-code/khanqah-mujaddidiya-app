"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentRole } from "@/lib/auth";
import { logActivity } from "@/lib/utils/activity-logger";

export interface EnrollMetadata {
  fullName: string;
  whatsapp: string;
  country?: string;
  city?: string;
}

/**
 * Enroll the current user in a module.
 * Handles duplicate enrollment gracefully (returns success if already enrolled).
 */
export async function enrollInModule(
  moduleId: string,
  metadata?: EnrollMetadata
): Promise<{ success: boolean; error?: string; alreadyEnrolled?: boolean }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Invariant: enrollment must reference valid module
  const { data: mod } = await supabase
    .from("modules")
    .select("id, title")
    .eq("id", moduleId)
    .eq("is_archived", false)
    .single();
  if (!mod) return { success: false, error: "Module not found or archived" };

  const { data: inserted, error } = await supabase
    .from("module_enrollments")
    .insert({
      module_id: moduleId,
      user_id: user.id,
      status: "active",
      full_name: metadata?.fullName?.trim() || null,
      whatsapp: metadata?.whatsapp?.trim() || null,
      country: metadata?.country?.trim() || null,
      city: metadata?.city?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: true, alreadyEnrolled: true };
    }
    return { success: false, error: error.message };
  }

  const actorRole = (await getCurrentRole()) ?? "student";
  await logActivity({
    actorId: user.id,
    actorRole,
    actionType: "create",
    entityType: "module_enrollment",
    entityId: inserted?.id ?? undefined,
    description: `Enrolled in module: ${(mod as { title: string }).title}`,
    metadata: { moduleId },
  });

  revalidatePath("/modules");
  revalidatePath("/profile");
  return { success: true };
}
