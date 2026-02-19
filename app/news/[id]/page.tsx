import Link from "next/link";
import { getPlatformNewsById } from "@/lib/data/platform-news";

const FALLBACK_NEWS: Record<string, { title: string; excerpt: string; date: string; body: string }> = {
  welcome: {
    title: "Welcome to the Learning Portal",
    excerpt: "Explore the modules and enroll when you are ready.",
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
  const dbItem = await getPlatformNewsById(id);
  const item = dbItem
    ? {
        title: dbItem.title,
        excerpt: dbItem.excerpt,
        date: new Date(dbItem.published_at).toLocaleDateString("en", { dateStyle: "medium" }),
        body: dbItem.body,
      }
    : FALLBACK_NEWS[id];

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
