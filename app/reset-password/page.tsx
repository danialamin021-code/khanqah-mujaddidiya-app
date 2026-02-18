"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import AuthOnboardingBackground from "@/components/AuthOnboardingBackground";

const LOGO_SRC = "/assets/common/onboardingauthlogo.png";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) {
        setError("Supabase is not configured.");
        setLoading(false);
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
      setSuccess(true);
      setLoading(false);
      router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/home");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthOnboardingBackground>
        <main className="flex min-h-screen flex-col items-center justify-center px-6 py-10 md:py-14">
          <div className="mx-auto w-full max-w-sm animate-fade-in rounded-2xl border border-white/20 bg-white/95 p-6 shadow-lg backdrop-blur-sm">
            <div className="flex justify-center">
              <Image src={LOGO_SRC} alt="Khanqah Mujaddidiya" width={200} height={80} className="h-16 w-auto max-w-[85vw] object-contain sm:h-20" />
            </div>
            <h1 className="mt-4 font-heading text-2xl font-normal text-deep-green">
              Password updated
            </h1>
            <p className="mt-2 text-sm text-foreground/80">
              Your password has been reset. Redirecting you…
            </p>
          </div>
        </main>
      </AuthOnboardingBackground>
    );
  }

  return (
    <AuthOnboardingBackground>
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-10 md:py-14">
        <div className="mx-auto w-full max-w-sm animate-fade-in rounded-2xl border border-white/20 bg-white/95 p-6 shadow-lg backdrop-blur-sm">
          <div className="flex justify-center">
            <Image src={LOGO_SRC} alt="Khanqah Mujaddidiya" width={200} height={80} className="h-16 w-auto max-w-[85vw] object-contain sm:h-20" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-normal text-deep-green">
            Set new password
          </h1>
          <p className="mt-2 text-sm text-foreground/80">
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="reset-password" className="block text-sm font-medium text-deep-green/90">
                New password
              </label>
              <input
                id="reset-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground placeholder-foreground/50 focus:border-deep-green/40 focus:outline-none focus:ring-1 focus:ring-deep-green/30"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label htmlFor="reset-confirm" className="block text-sm font-medium text-deep-green/90">
                Confirm password
              </label>
              <input
                id="reset-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground placeholder-foreground/50 focus:border-deep-green/40 focus:outline-none focus:ring-1 focus:ring-deep-green/30"
                placeholder="At least 6 characters"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-muted-gold px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-gold-hover disabled:opacity-50"
            >
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>

          <p className="mt-6 text-center">
            <Link href="/login" className="text-sm font-medium text-deep-green hover:underline">
              ← Back to login
            </Link>
          </p>
        </div>
      </main>
    </AuthOnboardingBackground>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthOnboardingBackground>
          <main className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
            <div className="h-8 w-8 animate-pulse rounded-full border-2 border-muted-gold border-t-transparent" />
          </main>
        </AuthOnboardingBackground>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
