import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import BayatFormTrigger from "./BayatFormTrigger";
import { BAYAT_HEADER_IMAGE } from "@/lib/constants/sheikh";

export default function BayatPage() {
  return (
    <main className="min-h-full px-4 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/home" className="text-sm font-medium text-deep-green/80 hover:text-deep-green">
          ← Home
        </Link>
        <div className="relative mt-4 aspect-[2/1] w-full overflow-hidden rounded-2xl bg-light-green/60 min-h-[8rem]">
          <SafeImage
            src={BAYAT_HEADER_IMAGE}
            alt=""
            fill
            className="object-cover object-center contrast-[1.1] brightness-[0.88]"
            sizes="(max-width: 672px) 100vw, 672px"
          />
          <div className="absolute inset-0 bg-black/30 pointer-events-none rounded-2xl" aria-hidden />
        </div>
        <h1 className="font-heading mt-4 text-2xl font-normal text-deep-green">
          Bayat
        </h1>

        <section className="mt-8 space-y-8">
          <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <h2 className="font-heading text-lg font-normal text-deep-green">
              What is Bayat
            </h2>
            <p className="mt-3 text-foreground/90 leading-relaxed">
              Bayat is a commitment made with full understanding and consent. It is a pledge of spiritual allegiance and willingness to learn and follow under the guidance of a qualified Sheikh. It is entered into only after reflection and with a clear intention.
            </p>
          </div>

          <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <h2 className="font-heading text-lg font-normal text-deep-green">
              Importance
            </h2>
            <p className="mt-3 text-foreground/90 leading-relaxed">
              Bayat establishes a bond between the seeker and the guide. It is the beginning of a disciplined path of learning, remembrance, and self-improvement. It is taken seriously and honoured by both parties.
            </p>
          </div>

          <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <h2 className="font-heading text-lg font-normal text-deep-green">
              Niyah (Intention)
            </h2>
            <p className="mt-3 text-foreground/90 leading-relaxed">
              Your intention should be sincere: to seek nearness to Allah, to follow the Sunnah, and to benefit from the guidance of the Sheikh. There is no compulsion; the step is yours when you are ready.
            </p>
          </div>

          <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <h2 className="font-heading text-lg font-normal text-deep-green">
              Purpose
            </h2>
            <p className="mt-3 text-foreground/90 leading-relaxed">
              The purpose of Bayat is to place oneself under the spiritual and educational care of a guide who can help in purification of the heart, correct practice of worship, and adherence to the way of the Prophet (peace be upon him).
            </p>
          </div>
        </section>

        <div className="mt-10">
          <BayatFormTrigger />
        </div>
      </div>
    </main>
  );
}
