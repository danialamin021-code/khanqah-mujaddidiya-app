"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import AuthOnboardingBackground from "@/components/AuthOnboardingBackground";
import { notifyRoleRequest } from "@/app/actions/notifications";

/** Same logo as onboarding — prominent and recognizable. */
const LOGO_SRC = "/assets/common/onboardingauthlogo.png";

type SignupRole = "student" | "teacher" | "admin";

/**
 * Sign-up page — email/password registration with 3 role options.
 * Student: full access immediately. Teacher/Admin: require backend approval.
 */
export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<SignupRole>("student");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) {
        setError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.");
        setLoading(false);
        return;
      }
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback` },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      if (data?.user && !data.user.identities?.length) {
        setError("An account with this email may already exist. Try logging in.");
        setLoading(false);
        return;
      }
      // Update profile: Student = full access; Teacher/Admin = role_request pending approval
      if (data?.user) {
        if (role === "student") {
          await supabase
            .from("profiles")
            .update({ roles: ["student"] })
            .eq("id", data.user.id);
        } else {
          await supabase
            .from("profiles")
            .update({
              roles: ["student"],
              role_request: role === "teacher" ? "pending_teacher" : "pending_admin",
            })
            .eq("id", data.user.id);
          await notifyRoleRequest(role as "teacher" | "admin", email);
        }
      }
      // Redirect if confirmed (e.g. email confirmation disabled) or if we have a session
      if (data?.user?.confirmed_at || data?.session) {
        if (role === "student") {
          router.push("/home");
        } else {
          router.push("/pending-approval");
        }
        router.refresh();
      } else {
        setMessage(
          role === "student"
            ? "Check your email to confirm your account, or sign in if you already confirmed."
            : "Check your email to confirm your account. After confirming, you will see your pending approval status."
        );
        setLoading(false);
      }
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
            Sign up
          </h1>
          <p className="mt-2 text-sm text-foreground/80">
            Create an account to enroll in learning modules and save your progress.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-deep-green/90">
                Email
              </label>
              <input
                id="signup-email"
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
              <label htmlFor="signup-password" className="block text-sm font-medium text-deep-green/90">
                Password
              </label>
              <input
                id="signup-password"
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
              <label className="block text-sm font-medium text-deep-green/90">
                I am joining as
              </label>
              <div className="mt-2 flex flex-wrap gap-4">
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === "student"}
                    onChange={() => setRole("student")}
                    className="h-4 w-4 border-green-soft text-deep-green focus:ring-deep-green/30"
                  />
                  <span className="text-sm text-foreground">Student</span>
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="teacher"
                    checked={role === "teacher"}
                    onChange={() => setRole("teacher")}
                    className="h-4 w-4 border-green-soft text-deep-green focus:ring-deep-green/30"
                  />
                  <span className="text-sm text-foreground">Teacher</span>
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === "admin"}
                    onChange={() => setRole("admin")}
                    className="h-4 w-4 border-green-soft text-deep-green focus:ring-deep-green/30"
                  />
                  <span className="text-sm text-foreground">Admin</span>
                </label>
              </div>
              <p className="mt-1 text-xs text-foreground/60">
                Student: full access immediately. Teacher and Admin: require verification and approval from an administrator.
              </p>
            </div>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-foreground/80" role="status">
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-muted-gold px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-gold-hover disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground/80">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-deep-green hover:underline">
              Log in
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
