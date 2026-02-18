import Link from "next/link";
import Image from "next/image";
import AuthOnboardingBackground from "@/components/AuthOnboardingBackground";

/** Logo for onboarding/auth screens — prominently sized, responsive. */
const LOGO_SRC = "/assets/common/onboardingauthlogo.png";

/**
 * Full-screen onboarding. Auth is the gateway — Enter/Skip lead to login.
 */
export default function OnboardingPage() {
  return (
    <AuthOnboardingBackground>
      <main className="flex min-h-screen flex-col items-center justify-between">
        <div className="flex w-full flex-1 flex-col items-center justify-center px-6 py-12">
          <Image
            src={LOGO_SRC}
            alt="Khanqah Mujaddidiyya"
            width={320}
            height={160}
            className="h-[7.5rem] w-auto max-w-[90vw] object-contain min-[375px]:h-[8.5rem] sm:h-[9.5rem] md:h-[10rem] md:max-w-[360px]"
            priority
          />
          <p className="mt-8 text-center text-sm text-white/75">
            A calm space for guided spiritual learning
          </p>
        </div>

        <div className="w-full max-w-sm px-6 pb-16 pt-4 space-y-4">
          <Link
            href="/login"
            className="block w-full rounded-lg bg-muted-gold py-3.5 text-center text-sm font-medium text-white transition-colors duration-200 hover:bg-gold-hover"
          >
            Enter
          </Link>
          <p className="text-center text-sm text-white/70">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-white hover:underline">
              Sign up
            </Link>
          </p>
          <Link
            href="/login"
            className="block text-center text-sm text-white/60 hover:text-white/80 transition-colors duration-200"
          >
            Skip for now
          </Link>
        </div>
      </main>
    </AuthOnboardingBackground>
  );
}
