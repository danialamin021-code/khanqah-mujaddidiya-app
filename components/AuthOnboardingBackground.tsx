import Image from "next/image";

/**
 * Shared full-screen background for onboarding and auth (login/signup).
 * Uses onboarding.bg image + dark overlay for consistency.
 */
const ONBOARDING_BG = "/assets/Onboarding.bg/onboarding.bg.png";

export default function AuthOnboardingBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={ONBOARDING_BG}
          alt=""
          fill
          className="object-cover object-center contrast-[1.08] brightness-[0.88]"
          priority
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-black/60" aria-hidden />
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
