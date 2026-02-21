/**
 * Invoke Supabase Edge Functions from server.
 * Uses user's session token for auth. Falls back gracefully if function not deployed.
 */

const getFunctionsUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  return `${url.replace(/\/$/, "")}/functions/v1`;
};

export async function invokeEnrollmentEngine(
  accessToken: string,
  action: "enroll" | "mark_whatsapp_joined",
  body: Record<string, unknown>
): Promise<{ success: boolean; error?: string; alreadyEnrolled?: boolean }> {
  const base = getFunctionsUrl();
  if (!base) return { success: false, error: "Edge Function URL not configured" };

  try {
    const res = await fetch(`${base}/enrollment-engine`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action, ...body }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      error?: string;
      alreadyEnrolled?: boolean;
    };
    if (!res.ok) return { success: false, error: data.error ?? `HTTP ${res.status}` };
    return {
      success: data.success ?? false,
      error: data.error,
      alreadyEnrolled: data.alreadyEnrolled,
    };
  } catch {
    return { success: false, error: "Edge Function unavailable" };
  }
}

export async function invokeAttendanceEngine(
  accessToken: string,
  action: "mark" | "bulk_mark",
  body: Record<string, unknown>
): Promise<{ success: boolean; error?: string; marked?: number }> {
  const base = getFunctionsUrl();
  if (!base) return { success: false, error: "Edge Function URL not configured", marked: 0 };

  try {
    const res = await fetch(`${base}/attendance-engine`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action, ...body }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      error?: string;
      marked?: number;
    };
    if (!res.ok) return { success: false, error: data.error ?? `HTTP ${res.status}` };
    return {
      success: data.success ?? false,
      error: data.error,
      marked: data.marked,
    };
  } catch {
    return { success: false, error: "Edge Function unavailable", marked: 0 };
  }
}

export async function invokeRoleEngine(
  accessToken: string,
  action: "approveRole" | "rejectRole" | "assignTeacher" | "unassignTeacher" | "updateUserRoles",
  payload: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const base = getFunctionsUrl();
  if (!base) return { success: false, error: "Edge Function URL not configured" };

  try {
    const res = await fetch(`${base}/role-engine`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action, payload }),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
    if (!res.ok) return { success: false, error: data.error ?? `HTTP ${res.status}` };
    return { success: data.success ?? false, error: data.error };
  } catch {
    return { success: false, error: "Edge Function unavailable" };
  }
}

export async function invokeBayatEngine(
  accessToken: string,
  payload: { fullName: string; whatsapp: string; country?: string; city?: string }
): Promise<{ success: boolean; error?: string; requestId?: string }> {
  const base = getFunctionsUrl();
  if (!base) return { success: false, error: "Edge Function URL not configured" };

  try {
    const res = await fetch(`${base}/bayat-engine`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ action: "submit", payload }),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string; requestId?: string };
    if (!res.ok) return { success: false, error: data.error ?? `HTTP ${res.status}` };
    return { success: data.success ?? false, error: data.error, requestId: data.requestId };
  } catch {
    return { success: false, error: "Edge Function unavailable" };
  }
}

export async function invokeAcademicEngine(
  accessToken: string,
  action: "createBatch" | "updateBatch" | "createBatchSession",
  payload: Record<string, unknown>
): Promise<{ success: boolean; error?: string; batchId?: string; sessionId?: string }> {
  const base = getFunctionsUrl();
  if (!base) return { success: false, error: "Edge Function URL not configured" };

  try {
    const res = await fetch(`${base}/academic-engine`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ action, payload }),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string; batchId?: string; sessionId?: string };
    if (!res.ok) return { success: false, error: data.error ?? `HTTP ${res.status}` };
    return { success: data.success ?? false, error: data.error, batchId: data.batchId, sessionId: data.sessionId };
  } catch {
    return { success: false, error: "Edge Function unavailable" };
  }
}

export async function invokeNotificationEngine(
  accessToken: string,
  action: "markRead" | "bulkMarkRead",
  payload: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const base = getFunctionsUrl();
  if (!base) return { success: false, error: "Edge Function URL not configured" };

  try {
    const res = await fetch(`${base}/notification-engine`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ action, payload }),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
    if (!res.ok) return { success: false, error: data.error ?? `HTTP ${res.status}` };
    return { success: data.success ?? false, error: data.error };
  } catch {
    return { success: false, error: "Edge Function unavailable" };
  }
}

/**
 * Internal: create role request notifications. Uses EDGE_INTERNAL_SECRET.
 * Call from server only (e.g. signup flow).
 */
export async function invokeNotificationEngineCreateRoleRequest(
  role: "teacher" | "admin",
  email: string
): Promise<{ success: boolean; error?: string }> {
  const base = getFunctionsUrl();
  const secret = process.env.EDGE_INTERNAL_SECRET?.trim();
  if (!base || !secret) return { success: false, error: "Notification engine not configured" };

  try {
    const res = await fetch(`${base}/notification-engine`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": secret,
      },
      body: JSON.stringify({ action: "createRoleRequest", payload: { role, email } }),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
    if (!res.ok) return { success: false, error: data.error ?? `HTTP ${res.status}` };
    return { success: data.success ?? false, error: data.error };
  } catch {
    return { success: false, error: "Edge Function unavailable" };
  }
}
