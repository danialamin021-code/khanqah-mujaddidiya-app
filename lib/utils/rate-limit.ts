/**
 * In-memory rate limiter for server actions.
 * Use for enrollment, bayat, guidance to prevent abuse.
 * Note: Resets on server restart; for multi-instance use Redis (e.g. Upstash).
 */

const store = new Map<string, { count: number; resetAt: number }>();

const CLEANUP_INTERVAL_MS = 60_000; // 1 min
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, v] of store.entries()) {
    if (v.resetAt < now) store.delete(key);
  }
}

/**
 * Check if the key has exceeded the rate limit.
 * @param key - Identifier (e.g. userId for authenticated actions)
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  cleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

/** Rate limit configs per action type. */
export const RATE_LIMITS = {
  enrollment: { max: 10, windowMs: 60_000 },      // 10 per minute
  bayat: { max: 3, windowMs: 3600_000 },         // 3 per hour
  guidance: { max: 5, windowMs: 3600_000 },      // 5 per hour
} as const;
