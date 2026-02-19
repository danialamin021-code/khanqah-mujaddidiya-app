/**
 * Environment validation — ensures required vars are set in production.
 * In development, logs warnings but does not throw.
 */

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const _optional = [
  "NEXT_PUBLIC_CONTACT_PHONE",
  "NEXT_PUBLIC_CONTACT_EMAIL",
  "NEXT_PUBLIC_CONTACT_WHATSAPP",
] as const;

export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0 && process.env.NODE_ENV === "production") {
    console.error(
      `[env] Missing required env vars in production: ${missing.join(", ")}. ` +
        "See .env.example for reference."
    );
    return { valid: false, missing };
  }
  if (missing.length > 0 && typeof window === "undefined") {
    console.warn(
      `[env] Supabase not configured (missing: ${missing.join(", ")}). ` +
        "Auth and data features will be disabled. Add vars to .env.local for full functionality."
    );
  }
  return { valid: true, missing: [] };
}

/** Call during app init (e.g. root layout) to validate env. */
export function assertEnvInProduction() {
  if (process.env.NODE_ENV !== "production") return;
  const { valid, missing } = validateEnv();
  if (!valid) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Set them in your hosting platform (Vercel, Netlify, etc.)."
    );
  }
}
