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
      <main className="flex min-h-screen items-center justify-center">
        <Link
          href="/login"
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-lg transition-transform duration-200 active:scale-[0.98] hover:scale-[1.02]"
          aria-label="Enter Khanqah Mujaddidiyya"
        >
          <Image
            src={LOGO_SRC}
            alt="Khanqah Mujaddidiyya"
            width={320}
            height={160}
            className="animate-logo-appear h-[8rem] w-auto max-w-[85vw] object-contain sm:h-[10rem] md:h-[11rem]"
            priority
          />
        </Link>
      </main>
    </AuthOnboardingBackground>
  );
}
