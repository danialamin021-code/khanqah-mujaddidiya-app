export default function DashboardLoading() {
  return (
    <main className="min-h-full px-4 py-8 md:py-10">
      <div className="mx-auto max-w-2xl animate-pulse">
        <div className="h-8 w-40 rounded bg-light-green/60" />
        <div className="mt-2 h-4 w-64 rounded bg-light-green/40" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-green-soft bg-light-green/30 p-6">
              <div className="h-4 w-32 rounded bg-light-green/60" />
              <div className="mt-2 h-8 w-16 rounded bg-light-green/60" />
            </div>
          ))}
        </div>
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-green-soft bg-light-green/30 p-5">
              <div className="h-5 w-48 rounded bg-light-green/60" />
              <div className="mt-3 h-3 w-full rounded bg-light-green/40" />
              <div className="mt-2 h-3 w-3/4 rounded bg-light-green/40" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
