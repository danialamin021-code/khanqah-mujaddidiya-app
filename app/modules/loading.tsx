export default function ModulesLoading() {
  return (
    <main className="min-h-full px-4 py-8 md:py-10">
      <div className="mx-auto max-w-4xl animate-pulse">
        <div className="h-8 w-56 rounded bg-light-green/60" />
        <div className="mt-2 h-4 w-80 rounded bg-light-green/40" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-green-soft bg-light-green/30 p-5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-light-green/50" />
              <div className="mt-3 h-5 w-24 rounded bg-light-green/60" />
              <div className="mt-2 h-3 w-full rounded bg-light-green/40" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
