import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import GuidanceRequestForm from "@/components/GuidanceRequestForm";
import { SHEIKH_CONFIG } from "@/lib/constants/sheikh";

export default function GuidancePage() {
  const { name, image, bioShort } = SHEIKH_CONFIG;
  return (
    <main className="min-h-full px-6 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          Guidance & Bayat
        </h1>
        <p className="mt-2 text-foreground/80">
          Human-led guidance with care and clarity. No automation—only respect and review.
        </p>

        <section className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-light-green">
            <SafeImage
              src={image}
              alt=""
              fill
              className="object-cover object-center"
              sizes="96px"
            />
          </div>
          <div>
            <h2 className="font-heading text-lg font-normal text-deep-green">
              {name}
            </h2>
            <p className="mt-2 text-foreground/80 leading-relaxed">
              {bioShort}
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-green-soft bg-light-green/50 p-6 shadow-sm animate-slide-up">
          <h2 className="font-heading text-sm font-normal text-deep-green">
            Guidance philosophy
          </h2>
          <p className="mt-3 text-foreground/90 leading-relaxed">
            Guidance in this tradition is offered with clarity and human review. There is no instant automation or algorithmic response. Requests are received, considered, and answered with care. You are never rushed.
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-green-soft bg-light-green/50 p-6 shadow-sm animate-slide-up">
          <h2 className="font-heading text-sm font-normal text-deep-green">
            Bayat
          </h2>
          <p className="mt-3 text-foreground/90 leading-relaxed">
            Bayat is a commitment made with full understanding and consent. It is explained before any request, and all requests are reviewed by a human guide. There are no instant confirmations—only clarity and patience.
          </p>
        </section>

        <div className="mt-10 space-y-8">
          <div>
            <label className="block text-sm font-medium text-deep-green/90 mb-2">Request Bayat</label>
            <Link
              href="/bayat"
              className="inline-block rounded-lg bg-muted-gold px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
            >
              Go to Bayat →
            </Link>
          </div>
          <div>
            <GuidanceRequestForm />
          </div>
          <p className="text-xs text-foreground/60">
            All requests will be human-reviewed.
          </p>
        </div>

        <section className="mt-10 border-t border-light-green pt-8">
          <p className="text-sm text-foreground/80">
            For questions about guidance or how to reach out, use the contact options below.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block text-sm font-medium text-deep-green/90 hover:text-deep-green transition-colors duration-200"
          >
            Contact →
          </Link>
        </section>
      </div>
    </main>
  );
}
