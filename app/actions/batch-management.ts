"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { invokeAcademicEngine } from "@/lib/utils/invoke-edge-function";

/**
 * Create a new batch. All logic in academic-engine Edge Function. No fallback.
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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { success: false, error: "Not authenticated" };

  const result = await invokeAcademicEngine(session.access_token, "createBatch", data);

  if (result.success) {
    revalidatePath("/admin/batches");
    revalidatePath("/admin");
  }
  return { success: result.success, error: result.error, batchId: result.batchId };
}

/**
 * Update a batch. All logic in academic-engine Edge Function. No fallback.
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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { success: false, error: "Not authenticated" };

  const result = await invokeAcademicEngine(session.access_token, "updateBatch", { batchId, ...data });

  if (result.success) {
    revalidatePath("/admin/batches");
    revalidatePath(`/admin/batches/${batchId}`);
    revalidatePath("/admin");
  }
  return { success: result.success, error: result.error };
}

/**
 * Create a batch session. All logic in academic-engine Edge Function. No fallback.
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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { success: false, error: "Not authenticated" };

  const result = await invokeAcademicEngine(session.access_token, "createBatchSession", data);

  if (result.success) {
    revalidatePath(`/teacher/batches/${data.batchId}`);
    revalidatePath(`/admin/batches`);
  }
  return { success: result.success, error: result.error, sessionId: result.sessionId };
}
