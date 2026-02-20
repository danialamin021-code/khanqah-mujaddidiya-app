/**
 * Production monitoring — error logging, push failure logging.
 * Integrate with Sentry: import * as Sentry from "@sentry/nextjs" and call Sentry.captureException.
 *
 * Usage:
 * - logError(error, context)
 * - logPushFailure(userId, tokenId, reason)
 *
 * For Sentry: add @sentry/nextjs, init in instrumentation.ts, use Sentry.captureException.
 */

export function logError(error: unknown, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "development") {
    console.error("[monitoring]", error, context);
  }
  // TODO: Sentry.captureException(error, { extra: context });
}

export function logPushFailure(
  userId: string,
  tokenId: string,
  reason: string
): void {
  if (process.env.NODE_ENV === "development") {
    console.warn("[push-failure]", { userId, tokenId, reason });
  }
  // TODO: Sentry.captureMessage("Push failed", { extra: { userId, tokenId, reason } });
}
