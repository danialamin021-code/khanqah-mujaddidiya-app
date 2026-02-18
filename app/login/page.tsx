"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import AuthOnboardingBackground from "@/components/AuthOnboardingBackground";

/** Same logo as onboarding — prominent and recognizable. */
const LOGO_SRC = "/assets/common/onboardingauthlogo.png";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/home");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <AuthOnboardingBackground>
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-10 md:py-14">
        <div className="mx-auto w-full max-w-sm animate-fade-in rounded-2xl border border-white/20 bg-white/95 p-6 shadow-lg backdrop-blur-sm">
          <div className="flex justify-center">
            <Image src={LOGO_SRC} alt="Khanqah Mujaddidiyya" width={200} height={80} className="h-16 w-auto max-w-[85vw] object-contain sm:h-20" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-normal text-deep-green">
            Log in
          </h1>
        <p className="mt-2 text-sm text-foreground/80">
          Sign in to save your progress and enroll in learning modules.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-deep-green/90">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground placeholder-foreground/50 focus:border-deep-green/40 focus:outline-none focus:ring-1 focus:ring-deep-green/30"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-deep-green/90">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground placeholder-foreground/50 focus:border-deep-green/40 focus:outline-none focus:ring-1 focus:ring-deep-green/30"
            />
          </div>
            <p className="text-sm">
              <Link href="/forgot-password" className="text-deep-green/80 hover:text-deep-green hover:underline">
                Forgot password?
              </Link>
            </p>
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
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/80">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-deep-green hover:underline">
            Sign up
          </Link>
        </p>

        <p className="mt-4 text-center">
          <Link href="/onboarding" className="text-sm text-deep-green/80 hover:text-deep-green transition-colors duration-200">
            ← Back
          </Link>
        </p>
        </div>
      </main>
    </AuthOnboardingBackground>
  );
}

/**
 * Login page — email/password sign-in. Same onboarding.bg as onboarding.
 * Auth gateway: sign in → redirect to /home.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <AuthOnboardingBackground>
        <main className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
          <div className="h-8 w-8 animate-pulse rounded-full border-2 border-muted-gold border-t-transparent" />
        </main>
      </AuthOnboardingBackground>
    }>
      <LoginForm />
    </Suspense>
  );
}
