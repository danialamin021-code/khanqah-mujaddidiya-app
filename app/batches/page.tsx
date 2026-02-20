import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveBatchesForModule } from "@/lib/data/batches";

export default async function BatchesPage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-foreground/70">Unable to load batches.</p>
      </main>
    );
  }

  const { data: modules } = await supabase
    .from("modules")
    .select("id, slug, title")
    .eq("is_archived", false)
    .order("sort_order");

  const batchesByModule: { module: { id: string; slug: string; title: string }; batches: { id: string; name: string }[] }[] = [];

  for (const m of modules ?? []) {
    const batches = await getActiveBatchesForModule(m.id);
    if (batches.length > 0) {
      batchesByModule.push({
        module: m,
        batches: batches.map((b) => ({ id: b.id, name: b.name })),
      });
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-heading text-2xl font-normal text-deep-green">Academic Batches</h1>
      <p className="mt-2 text-sm text-foreground/70">
        Browse and enroll in batches for each module.
      </p>

      {batchesByModule.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-green-soft bg-light-green/30 p-6">
          <p className="text-foreground/80">No active batches yet. Check back later.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {batchesByModule.map(({ module: mod, batches }) => (
            <section
              key={mod.id}
              className="rounded-2xl border border-green-soft bg-light-green/30 p-6"
            >
              <h2 className="font-heading text-lg font-normal text-deep-green">{mod.title}</h2>
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
          ))}
        </div>
      )}

      <Link
        href="/modules"
        className="mt-8 inline-block text-sm font-medium text-deep-green/80 hover:text-deep-green"
      >
        ← All modules
      </Link>
    </main>
  );
}
