"use client";

/**
 * Quick view of batches for a module. Informational only — no CTA buttons.
 * User enrolls via the single "Enroll in [Module]" button and selects batch in the form.
 */
export default function ModuleBatchesSection({
  batches,
}: {
  batches: {
    id: string;
    name: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
  }[];
}) {
  const batchCount = batches.length;

  if (batchCount === 0) {
    return (
      <section className="mt-8 rounded-2xl border border-green-soft bg-light-green/30 p-6">
        <h2 className="font-heading text-sm font-normal text-deep-green">Batches</h2>
        <p className="mt-2 text-sm text-foreground/70">No batches for this module yet. Check back later.</p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-green-soft bg-light-green/30 p-6">
      <h2 className="font-heading text-sm font-normal text-deep-green">Current batches</h2>
      <p className="mt-1 text-sm text-foreground/70">
        {batchCount === 1 ? "One batch available." : `${batchCount} batches available.`} Select your preferred batch when enrolling below.
      </p>
      <div className="mt-4 space-y-3">
        {batches.map((b) => (
          <div
            key={b.id}
            className="rounded-lg border border-green-soft/60 bg-[var(--background)] p-4"
          >
            <p className="font-medium text-deep-green/90">{b.name}</p>
            {b.description && (
              <p className="mt-1 text-sm text-foreground/80 line-clamp-2">{b.description}</p>
            )}
            {(b.start_date || b.end_date) && (
              <p className="mt-2 text-xs text-foreground/60">
                {b.start_date ? `Start: ${new Date(b.start_date).toLocaleDateString()}` : ""}
                {b.start_date && b.end_date ? " · " : ""}
                {b.end_date ? `End: ${new Date(b.end_date).toLocaleDateString()}` : ""}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
