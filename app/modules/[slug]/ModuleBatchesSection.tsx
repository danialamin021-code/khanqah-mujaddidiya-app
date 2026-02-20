"use client";

import Link from "next/link";

/**
 * Hybrid module + batch: if 1 batch auto-link, if >1 show selector.
 * Students never see batch selector if only one exists.
 */
export default function ModuleBatchesSection({
  batches,
}: {
  batches: { id: string; name: string }[];
}) {
  const batchCount = batches.length;

  if (batchCount === 0) {
    return (
      <section className="mt-8 rounded-2xl border border-green-soft bg-light-green/30 p-6">
        <h2 className="font-heading text-sm font-normal text-deep-green">Batches</h2>
        <p className="mt-2 text-sm text-foreground/70">No batches for this module yet.</p>
        <Link href="/batches" className="mt-4 inline-block text-sm font-medium text-deep-green hover:underline">
          Browse all batches →
        </Link>
      </section>
    );
  }

  if (batchCount === 1) {
    const batch = batches[0];
    return (
      <section className="mt-8 rounded-2xl border border-green-soft bg-light-green/30 p-6">
        <h2 className="font-heading text-sm font-normal text-deep-green">Batch</h2>
        <p className="mt-2 text-sm text-foreground/70">One batch available.</p>
        <Link
          href={`/batches/${batch.id}`}
          className="mt-4 inline-block rounded-lg bg-muted-gold px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
        >
          View & Enroll — {batch.name}
        </Link>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-green-soft bg-light-green/30 p-6">
      <h2 className="font-heading text-sm font-normal text-deep-green">Select Batch</h2>
      <p className="mt-2 text-sm text-foreground/70">Multiple batches available. Choose one to view and enroll.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {batches.map((b) => (
          <Link
            key={b.id}
            href={`/batches/${b.id}`}
            className="rounded-lg border border-green-soft bg-[var(--background)] px-4 py-2 text-sm font-medium text-deep-green transition-colors hover:bg-light-green/50"
          >
            {b.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
