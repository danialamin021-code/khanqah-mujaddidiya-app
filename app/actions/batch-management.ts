"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getCurrentRole } from "@/lib/auth";
import { logActivity } from "@/lib/utils/activity-logger";

/**
 * Create a new batch. Admin/Director only.
 */
export async function createBatch(data: {
  moduleId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  teacherId?: string;
  whatsappGroupLink?: string;
  price?: number;
  currency?: string;
  isPaid?: boolean;
}): Promise<{ success: boolean; error?: string; batchId?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const role = await getCurrentRole();
  if (role !== "admin" && role !== "director") {
    return { success: false, error: "Unauthorized" };
  }

  const { data: inserted, error } = await supabase
    .from("batches")
    .insert({
      module_id: data.moduleId,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      start_date: data.startDate || null,
      end_date: data.endDate || null,
      teacher_id: data.teacherId || null,
      whatsapp_group_link: data.whatsappGroupLink?.trim() || null,
      price: data.price ?? 0,
      currency: data.currency ?? "PKR",
      is_paid: data.isPaid ?? false,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await logActivity({
    actorId: user.id,
    actorRole: role ?? "admin",
    actionType: "create",
    entityType: "batch",
    entityId: inserted?.id,
    description: `Created batch: ${data.name}`,
    metadata: { batchId: inserted?.id },
  });

  revalidatePath("/admin/batches");
  revalidatePath("/admin");
  return { success: true, batchId: inserted?.id };
}

/**
 * Update a batch. Admin/Director only.
 */
export async function updateBatch(
  batchId: string,
  data: {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    teacherId?: string | null;
    whatsappGroupLink?: string | null;
    price?: number;
    currency?: string;
    isPaid?: boolean;
    isActive?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const role = await getCurrentRole();
  if (role !== "admin" && role !== "director") {
    return { success: false, error: "Unauthorized" };
  }

  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name.trim();
  if (data.description !== undefined) updates.description = data.description?.trim() || null;
  if (data.startDate !== undefined) updates.start_date = data.startDate || null;
  if (data.endDate !== undefined) updates.end_date = data.endDate || null;
  if (data.teacherId !== undefined) updates.teacher_id = data.teacherId || null;
  if (data.whatsappGroupLink !== undefined) updates.whatsapp_group_link = data.whatsappGroupLink?.trim() || null;
  if (data.price !== undefined) updates.price = data.price;
  if (data.currency !== undefined) updates.currency = data.currency;
  if (data.isPaid !== undefined) updates.is_paid = data.isPaid;
  if (data.isActive !== undefined) updates.is_active = data.isActive;

  const { error } = await supabase.from("batches").update(updates).eq("id", batchId);

  if (error) return { success: false, error: error.message };

  await logActivity({
    actorId: user.id,
    actorRole: role ?? "admin",
    actionType: "update",
    entityType: "batch",
    entityId: batchId,
    description: `Updated batch`,
    metadata: { batchId },
  });

  revalidatePath("/admin/batches");
  revalidatePath(`/admin/batches/${batchId}`);
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Create a batch session. Teacher of batch or Admin/Director.
 */
export async function createBatchSession(data: {
  batchId: string;
  title: string;
  sessionDate: string;
  zoomLink?: string;
  topic?: string;
}): Promise<{ success: boolean; error?: string; sessionId?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: batch } = await supabase
    .from("batches")
    .select("id, teacher_id")
    .eq("id", data.batchId)
    .single();
  if (!batch) return { success: false, error: "Batch not found" };

  const role = await getCurrentRole();
  const isTeacher = batch.teacher_id === user.id;
  const isAdminOrDirector = role === "admin" || role === "director";
  if (!isTeacher && !isAdminOrDirector) return { success: false, error: "Unauthorized" };

  const { data: inserted, error } = await supabase
    .from("batch_sessions")
    .insert({
      batch_id: data.batchId,
      title: data.title.trim(),
      session_date: data.sessionDate,
      zoom_link: data.zoomLink?.trim() || null,
      topic: data.topic?.trim() || null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  const serviceClient = createServiceClient();
  if (serviceClient) {
    await serviceClient.rpc("recalculate_batch_participation_all", { p_batch_id: data.batchId });
  }

  revalidatePath(`/teacher/batches/${data.batchId}`);
  revalidatePath(`/admin/batches`);
  return { success: true, sessionId: inserted?.id };
}
