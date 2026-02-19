import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12">
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/home"
          className="mt-6 inline-block rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
        >
          Go to Home
        </Link>
      </div>
    </main>
  );
}
