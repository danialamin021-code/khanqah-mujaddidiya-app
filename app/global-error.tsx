"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body className="antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-6 py-12">
          <div className="mx-auto max-w-md text-center">
            <h1 className="font-heading text-2xl font-normal text-deep-green">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-foreground/70">
              A critical error occurred. Please refresh the page or try again later.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
