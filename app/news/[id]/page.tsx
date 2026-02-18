import Link from "next/link";

/** Placeholder detail — same static data as home list. Replace with API later. */
const PLACEHOLDER_NEWS: Record<string, { title: string; excerpt: string; date: string; body: string }> = {
  "1": {
    title: "New Tafseer Session Schedule",
    excerpt: "Updated timings for the weekly Tafseer module.",
    date: "Feb 2025",
    body: "Sessions now run every Saturday. Please check the module page for the weekly schedule. Enroll when you are ready.",
  },
  "2": {
    title: "Bayat Guidance Update",
    excerpt: "A short note on the importance of intention and readiness.",
    date: "Jan 2025",
    body: "Your intention should be sincere: to seek nearness to Allah, to follow the Sunnah, and to benefit from the guidance of the Sheikh. There is no compulsion; the step is yours when you are ready.",
  },
  "3": {
    title: "Welcome to the Learning Portal",
    excerpt: "Explore the nine modules and enroll when you are ready.",
    date: "Jan 2025",
    body: "Explore the nine modules and enroll when you are ready. No pressure — learn at your pace. Reach out via Contact if you have questions.",
  },
};

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = PLACEHOLDER_NEWS[id];

  if (!item) {
    return (
      <main className="min-h-full px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-foreground/80">News item not found.</p>
          <Link href="/home" className="mt-4 inline-block text-sm font-medium text-deep-green hover:underline">
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full px-4 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/home"
          className="text-sm font-medium text-deep-green/80 hover:text-deep-green"
        >
          ← News & Updates
        </Link>
        <h1 className="font-heading mt-4 text-2xl font-normal text-deep-green">
          {item.title}
        </h1>
        <p className="mt-2 text-sm text-foreground/60">{item.date}</p>
        <section className="mt-6 rounded-2xl border border-green-soft bg-light-green/50 p-6">
          <p className="text-foreground/90 leading-relaxed">{item.body}</p>
        </section>
        <p className="mt-6">
          <Link href="/home" className="text-sm font-medium text-deep-green hover:underline">
            ← Back to Home
          </Link>
        </p>
      </div>
    </main>
  );
}
