"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentRole } from "@/lib/auth";
import { logActivity } from "@/lib/utils/activity-logger";
import { getTeachersForModule } from "@/lib/data/modules";
import { notifyEnrollmentWebhook } from "@/lib/utils/notify-webhook";
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rate-limit";

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

  const { max, windowMs } = RATE_LIMITS.enrollment;
  if (!checkRateLimit(`enrollment:${user.id}`, max, windowMs)) {
    return { success: false, error: "Too many enrollment attempts. Please try again later." };
  }

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

  const teachers = await getTeachersForModule(moduleId);
  await notifyEnrollmentWebhook({
    event: "module_enrollment",
    enrollmentId: inserted!.id,
    module: { id: mod.id, title: (mod as { title: string }).title },
    student: {
      fullName: metadata?.fullName?.trim() || null,
      whatsapp: metadata?.whatsapp?.trim() || null,
      email: user.email ?? null,
    },
    teachers: teachers.map((t) => ({
      userId: t.id,
      fullName: t.fullName,
      email: t.email ?? null,
    })),
    notifyAdmin: true,
    submittedAt: new Date().toISOString(),
  });

  revalidatePath("/modules");
  revalidatePath("/profile");
  return { success: true };
}
