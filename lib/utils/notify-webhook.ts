/**
 * Webhook notifications for Bayat, Guidance, and Module Enrollment.
 * Connect to Zapier, Make.com, or custom server to send WhatsApp/email.
 *
 * - BAYAT_WEBHOOK_URL: Director only (Bayat requests)
 * - REQUEST_WEBHOOK_URL: Fallback for Bayat/Guidance (legacy)
 * - ENROLLMENT_WEBHOOK_URL: Teacher + Admin (new module enrollments)
 *
 * Optional: Set WEBHOOK_SECRET to sign payloads with HMAC-SHA256.
 * Receivers can verify X-Webhook-Signature: sha256=<hex> header.
 */

import { createHmac } from "crypto";

export interface RequestPayload {
  type: "bayat" | "guidance";
  id: string;
  fullName: string;
  whatsapp: string;
  country?: string;
  city?: string;
  message?: string;
  submittedAt: string;
}

export interface EnrollmentPayload {
  event: "module_enrollment";
  enrollmentId: string;
  module: { id: string; title: string };
  student: {
    fullName: string | null;
    whatsapp: string | null;
    email: string | null;
  };
  teachers: Array<{ userId: string; fullName: string; email: string | null }>;
  notifyAdmin: true;
  submittedAt: string;
}

function getWebhookHeaders(body: string): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const secret = process.env.WEBHOOK_SECRET?.trim();
  if (secret) {
    const sig = createHmac("sha256", secret).update(body).digest("hex");
    headers["X-Webhook-Signature"] = `sha256=${sig}`;
  }
  return headers;
}

export async function notifyRequestWebhook(payload: RequestPayload): Promise<void> {
  const url =
    payload.type === "bayat"
      ? process.env.BAYAT_WEBHOOK_URL?.trim() || process.env.REQUEST_WEBHOOK_URL?.trim()
      : process.env.REQUEST_WEBHOOK_URL?.trim();
  if (!url) return;

  const body = JSON.stringify(payload);
  try {
    await fetch(url, {
      method: "POST",
      headers: getWebhookHeaders(body),
      body,
    });
  } catch {
    // Silent fail — webhook is optional; don't block the request
  }
}

/** Notify teacher(s) and admin about new module enrollment. Director-only for Bayat uses BAYAT_WEBHOOK_URL. */
export async function notifyEnrollmentWebhook(payload: EnrollmentPayload): Promise<void> {
  const url = process.env.ENROLLMENT_WEBHOOK_URL?.trim();
  if (!url) return;

  const body = JSON.stringify(payload);
  try {
    await fetch(url, {
      method: "POST",
      headers: getWebhookHeaders(body),
      body,
    });
  } catch {
    // Silent fail — webhook is optional
  }
}
