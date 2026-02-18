import Link from "next/link";
import Image from "next/image";

/**
 * Full Sheikh introduction screen.
 * TODO: Replace placeholder image and copy with final content.
 */
const SHEIKH_IMAGE = "/assets/Modules/Sheikh.png";

export default function SheikhPage() {
  return (
    <main className="min-h-full px-4 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/home" className="text-sm font-medium text-deep-green/80 hover:text-deep-green">
          ← Home
        </Link>
        <h1 className="font-heading mt-4 text-2xl font-normal text-deep-green">
          Sheikh Introduction
        </h1>
        <p className="mt-1 text-foreground/70">
          Professor Dr. Waseem Ahmed Farooqi
        </p>

        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start">
          {/* Top profile image placeholder. TODO: Replace with respectful image of Sheikh from /public/assets/. */}
          <div className="relative aspect-square w-48 shrink-0 overflow-hidden rounded-2xl bg-light-green">
            <Image
              src={SHEIKH_IMAGE}
              alt=""
              fill
              className="object-cover object-center contrast-[1.08] brightness-[0.92]"
              sizes="192px"
            />
            <div className="absolute inset-0 bg-black/20 pointer-events-none rounded-2xl" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg font-normal text-deep-green">
              Introduction
            </h2>
            <p className="mt-3 text-foreground/90 leading-relaxed">
              Professor Dr. Waseem Ahmed Farooqi is a scholar and spiritual guide in the Mujaddidi tradition. His work spans traditional Islamic sciences, spiritual guidance, and the establishment of Markaz-e-Mujaddidiyya. He offers Bayat and ongoing guidance to seekers with care and clarity. All requests are reviewed personally; there is no automation — only human attention and respect.
            </p>
            <p className="mt-4 text-foreground/90 leading-relaxed">
              This introduction is a placeholder. Final detailed text and image will be provided by the Markaz. The layout is clean and scrollable for reading comfort.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
