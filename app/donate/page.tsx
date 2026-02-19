import Link from "next/link";

const DONATION_URL = process.env.NEXT_PUBLIC_DONATION_URL?.trim();

export default function DonatePage() {
  return (
    <main className="min-h-full px-4 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/home" className="text-sm font-medium text-deep-green/80 hover:text-deep-green">
          ← Home
        </Link>
        <h1 className="font-heading mt-4 text-2xl font-normal text-deep-green">
          Support the Khanqah
        </h1>
        <p className="mt-2 text-foreground/80">
          Your support helps sustain the learning and guidance offered here.
        </p>

        {DONATION_URL ? (
          <div className="mt-8 rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <p className="text-foreground/90">
              You can contribute through our secure donation page.
            </p>
            <a
              href={DONATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-lg bg-muted-gold px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
            >
              Donate →
            </a>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <p className="text-foreground/80">
              Donation options will be available soon. For now, please reach out via{" "}
              <Link href="/contact" className="font-medium text-deep-green hover:underline">
                Contact
              </Link>{" "}
              if you wish to contribute.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
