import Link from "next/link";
import { getPlatformNews } from "@/lib/data/platform-news";

/** Fallback when DB has no news. */
const FALLBACK_NEWS = [
  { id: "welcome", title: "Welcome to the Learning Portal", excerpt: "Explore the modules and enroll when you are ready. No pressure — learn at your pace.", date: "Jan 2025" },
];

export default async function NewsAndUpdates() {
  const items = await getPlatformNews(10);

  const displayItems =
    items.length > 0
      ? items.map((i) => ({
          id: i.id,
          title: i.title,
          excerpt: i.excerpt,
          date: new Date(i.published_at).toLocaleDateString("en", { month: "short", year: "numeric" }),
        }))
      : FALLBACK_NEWS.map((i) => ({ id: i.id, title: i.title, excerpt: i.excerpt, date: i.date }));

  return (
    <section className="border-t border-light-green bg-[var(--background)] px-4 py-8 md:py-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-heading text-xl font-normal text-deep-green">
          News & Updates
        </h2>
        <p className="mt-1 text-sm text-foreground/70">
          Announcements and updates from the Khanqah.
        </p>
        <ul className="mt-6 space-y-4">
          {displayItems.map((item) => (
            <li key={item.id}>
              <Link
                href={`/news/${item.id}`}
                className="block overflow-hidden rounded-2xl border border-green-soft bg-light-green/50 p-5 shadow-sm transition-all duration-200 hover:border-deep-green/30 hover:bg-light-green hover:shadow-md"
              >
                <span className="font-heading font-normal text-deep-green">
                  {item.title}
                </span>
                <p className="mt-2 text-sm text-foreground/80 line-clamp-2">
                  {item.excerpt}
                </p>
                <p className="mt-2 text-xs text-foreground/60">{item.date}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
