"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getCurrentRole } from "@/lib/auth";
import { logActivity } from "@/lib/utils/activity-logger";
import { createNotification } from "@/lib/utils/notifications";
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rate-limit";

export interface BatchEnrollMetadata {
  fullName: string;
  whatsapp: string;
  country?: string;
  city?: string;
}

/**
 * Enroll the current user in a batch.
 */
export async function enrollInBatch(
  batchId: string,
  metadata?: BatchEnrollMetadata
): Promise<{ success: boolean; error?: string; alreadyEnrolled?: boolean }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { max, windowMs } = RATE_LIMITS.enrollment;
  if (!checkRateLimit(`batch_enrollment:${user.id}`, max, windowMs)) {
    return { success: false, error: "Too many enrollment attempts. Please try again later." };
  }

  const { data: batch } = await supabase
    .from("batches")
    .select("id, name, teacher_id, module_id, whatsapp_group_link")
    .eq("id", batchId)
    .eq("is_active", true)
    .single();
  if (!batch) return { success: false, error: "Batch not found or inactive" };

  const { data: inserted, error } = await supabase
    .from("batch_enrollments")
    .insert({
      batch_id: batchId,
      user_id: user.id,
      full_name: metadata?.fullName?.trim() || null,
      whatsapp: metadata?.whatsapp?.trim() || null,
      country: metadata?.country?.trim() || null,
      city: metadata?.city?.trim() || null,
      enrollment_status: "active",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { success: true, alreadyEnrolled: true };
    return { success: false, error: error.message };
  }

  const actorRole = (await getCurrentRole()) ?? "student";
  await logActivity({
    actorId: user.id,
    actorRole,
    actionType: "create",
    entityType: "batch_enrollment",
    entityId: inserted?.id ?? undefined,
    description: `Enrolled in batch: ${(batch as { name: string }).name}`,
    metadata: { batchId },
  });

  const batchName = (batch as { name: string }).name;

  const teacherIds: string[] = [];
  const adminIds: string[] = [];
  if (batch.teacher_id) teacherIds.push(batch.teacher_id);

  const serviceClient = createServiceClient();
  if (serviceClient) {
    const { data: adminProfiles } = await serviceClient
      .from("profiles")
      .select("id")
      .or("roles.cs.{admin},roles.cs.{director}");
    if (adminProfiles) {
      for (const p of adminProfiles) {
        if (p.id && !teacherIds.includes(p.id as string)) adminIds.push(p.id as string);
      }
    }
  }

  await Promise.all([
    createNotification({
      userId: user.id,
      type: "batch_enrollment",
      title: "Enrollment successful",
      body: `Welcome to ${batchName}.`,
      metadata: { batchId },
    }),
    ...teacherIds.map((uid) =>
      createNotification({
        userId: uid,
        type: "new_enrollment",
        title: "New batch enrollment",
        body: `A student enrolled in ${batchName}.`,
        metadata: { batchId, studentId: user.id },
      })
    ),
    ...adminIds.map((uid) =>
      createNotification({
        userId: uid,
        type: "enrollment_new",
        title: "New batch enrollment",
        body: `A student enrolled in ${batchName}.`,
        metadata: { batchId, studentId: user.id },
      })
    ),
  ]);

  revalidatePath("/batches");
  revalidatePath(`/batches/${batchId}`);
  revalidatePath("/modules");
  revalidatePath("/profile");
  return { success: true };
}

/**
 * Mark that the user has joined the WhatsApp group.
 */
export async function markJoinedWhatsApp(batchId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("batch_enrollments")
    .update({ joined_whatsapp: true })
    .eq("batch_id", batchId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath(`/batches/${batchId}`);
  revalidatePath("/profile");
  return { success: true };
}
