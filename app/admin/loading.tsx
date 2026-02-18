export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-48 rounded bg-light-green/60" />
        <div className="mt-2 h-4 w-72 rounded bg-light-green/40" />
      </div>
      <section>
        <div className="mb-4 h-6 w-36 rounded bg-light-green/60" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-green-soft bg-light-green/30 p-6">
              <div className="h-4 w-24 rounded bg-light-green/60" />
              <div className="mt-2 h-8 w-12 rounded bg-light-green/60" />
              <div className="mt-2 h-3 w-16 rounded bg-light-green/40" />
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-green-soft bg-light-green/30 p-6">
        <div className="h-6 w-40 rounded bg-light-green/60" />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-green-soft bg-[var(--background)] p-4">
              <div className="h-4 w-28 rounded bg-light-green/60" />
              <div className="mt-2 h-8 w-16 rounded bg-light-green/60" />
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-green-soft bg-light-green/30 p-6">
        <div className="h-6 w-44 rounded bg-light-green/60" />
        <div className="mt-4 h-4 w-full rounded bg-light-green/40" />
        <div className="mt-2 h-32 w-full rounded bg-light-green/30" />
      </section>
    </div>
  );
}
