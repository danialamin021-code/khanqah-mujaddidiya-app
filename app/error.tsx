"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12">
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          An unexpected error occurred. Please try again.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
          >
            Try again
          </button>
          <Link
            href="/home"
            className="rounded-lg border border-green-soft px-4 py-2 text-sm font-medium text-deep-green transition-colors hover:bg-light-green/50"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
