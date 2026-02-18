import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for client components (browser).
 * Use this in "use client" components for auth and data.
 * Local test: sign up / log in from login/signup pages.
 */
/**
 * Returns Supabase client or null if env vars are missing (e.g. Phase 1 without .env.local).
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
