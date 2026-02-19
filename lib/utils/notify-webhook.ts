/**
 * Webhook notification for Bayat/Guidance requests.
 * Set REQUEST_WEBHOOK_URL (server-only) to POST request data when submitted.
 * Connect to Zapier, Make.com, or custom server to send WhatsApp/email.
 */

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

export async function notifyRequestWebhook(payload: RequestPayload): Promise<void> {
  const url = process.env.REQUEST_WEBHOOK_URL?.trim();
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silent fail — webhook is optional; don't block the request
  }
}
