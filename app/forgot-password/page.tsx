"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import AuthOnboardingBackground from "@/components/AuthOnboardingBackground";

const LOGO_SRC = "/assets/common/onboardingauthlogo.png";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) {
        setError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.");
        setLoading(false);
        return;
      }
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/reset-password`,
      });
      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }
      setSent(true);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthOnboardingBackground>
        <main className="flex min-h-screen flex-col items-center justify-center px-6 py-10 md:py-14">
          <div className="mx-auto w-full max-w-sm animate-fade-in rounded-2xl border border-white/20 bg-white/95 p-6 shadow-lg backdrop-blur-sm">
            <div className="flex justify-center">
              <Image src={LOGO_SRC} alt="Khanqah Mujaddidiyya" width={200} height={80} className="h-16 w-auto max-w-[85vw] object-contain sm:h-20" />
            </div>
            <h1 className="mt-4 font-heading text-2xl font-normal text-deep-green">
              Check your email
            </h1>
            <p className="mt-2 text-sm text-foreground/80">
              We&apos;ve sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.
            </p>
            <Link
              href="/login"
              className="mt-6 block w-full rounded-lg bg-muted-gold py-3 text-center text-sm font-medium text-white transition-colors duration-200 hover:bg-gold-hover"
            >
              Back to login
            </Link>
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
            Forgot password
          </h1>
          <p className="mt-2 text-sm text-foreground/80">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="forgot-email" className="block text-sm font-medium text-deep-green/90">
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground placeholder-foreground/50 focus:border-deep-green/40 focus:outline-none focus:ring-1 focus:ring-deep-green/30"
                placeholder="you@example.com"
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
              {loading ? "Sending…" : "Send reset link"}
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

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
