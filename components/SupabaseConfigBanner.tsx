"use client";

/**
 * Shows a clear message when Supabase is misconfigured (missing env vars).
 * Renders only when NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY are missing.
 */
export default function SupabaseConfigBanner() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) return null;

  return (
    <div
      className="bg-amber-500/90 px-4 py-2 text-center text-sm font-medium text-white"
      role="alert"
    >
      Supabase is not configured. Add{" "}
      <code className="rounded bg-white/20 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
      <code className="rounded bg-white/20 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
      <code className="rounded bg-white/20 px-1">.env.local</code> to enable auth and data.
    </div>
  );
}
