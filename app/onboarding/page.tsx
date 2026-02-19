import Link from "next/link";
import Image from "next/image";
import AuthOnboardingBackground from "@/components/AuthOnboardingBackground";

/** Logo for onboarding/auth screens — prominently sized, responsive. */
const LOGO_SRC = "/assets/common/onboardingauthlogo.png";

/**
 * Minimal onboarding — logo only, centered. Tap to enter.
 * No nav bars until authenticated (handled by AuthAwareLayout).
 */
export default function OnboardingPage() {
  return (
    <AuthOnboardingBackground>
      <main className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center">
          <Image
            src={LOGO_SRC}
            alt="Khanqah Mujaddidiyya"
            width={320}
            height={160}
            className="animate-logo-appear h-[8rem] w-auto max-w-[85vw] object-contain sm:h-[10rem] md:h-[11rem]"
            priority
          />
        </div>
        <div className="pb-8 pt-4">
          <Link
            href="/login"
            className="mx-auto flex w-full max-w-[12rem] items-center justify-center rounded-lg border-2 border-white/60 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:bg-white/20 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="Enter Khanqah Mujaddidiyya"
          >
            ENTER
          </Link>
        </div>
      </main>
    </AuthOnboardingBackground>
  );
}
