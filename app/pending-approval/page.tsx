import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import AuthOnboardingBackground from "@/components/AuthOnboardingBackground";

const LOGO_SRC = "/assets/common/onboardingauthlogo.png";

export default async function PendingApprovalPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/onboarding");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("roles, role_request")
    .eq("id", user.id)
    .single();

  const roleRequest = (profile as { role_request?: string | null })?.role_request ?? null;
  const roles = (profile as { roles?: string[] })?.roles ?? ["student"];

  // Already approved (has teacher or admin role)
  if (roles.includes("teacher") || roles.includes("admin") || roles.includes("director")) {
    redirect("/home");
  }

  // No pending request — regular student
  if (!roleRequest) {
    redirect("/home");
  }

  const isTeacher = roleRequest === "pending_teacher";
  const roleLabel = isTeacher ? "Teacher" : "Admin";

  return (
    <AuthOnboardingBackground>
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-10 md:py-14">
        <div className="mx-auto w-full max-w-sm animate-fade-in rounded-2xl border border-white/20 bg-white/95 p-6 shadow-lg backdrop-blur-sm">
          <div className="flex justify-center">
            <Image src={LOGO_SRC} alt="Khanqah Mujaddidiya" width={200} height={80} className="h-16 w-auto max-w-[85vw] object-contain sm:h-20" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-normal text-deep-green">
            Pending approval
          </h1>
          <p className="mt-2 text-sm text-foreground/80">
            Your {roleLabel} request is pending verification. An administrator will review your account and activate your {roleLabel} access once approved.
          </p>
          <p className="mt-4 text-sm text-foreground/70">
            Until then, you can browse the app as a student. You will be notified when your request is approved.
          </p>
          <Link
            href="/home"
            className="mt-6 block w-full rounded-lg bg-muted-gold py-3 text-center text-sm font-medium text-white transition-colors duration-200 hover:bg-gold-hover"
          >
            Continue to Home
          </Link>
          <p className="mt-4 text-center">
            <Link href="/profile" className="text-sm font-medium text-deep-green hover:underline">
              View Profile
            </Link>
          </p>
        </div>
      </main>
    </AuthOnboardingBackground>
  );
}
