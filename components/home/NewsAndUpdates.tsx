"use client";

import Link from "next/link";

/** Static placeholder items — replace with API later. */
const PLACEHOLDER_NEWS = [
  { id: "1", title: "New Tafseer Session Schedule", excerpt: "Updated timings for the weekly Tafseer module. Sessions now run every Saturday.", date: "Feb 2025" },
  { id: "2", title: "Bayat Guidance Update", excerpt: "A short note on the importance of intention and readiness before taking Bayat.", date: "Jan 2025" },
  { id: "3", title: "Welcome to the Learning Portal", excerpt: "Explore the nine modules and enroll when you are ready. No pressure — learn at your pace.", date: "Jan 2025" },
];

export default function NewsAndUpdates() {
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
          {PLACEHOLDER_NEWS.map((item) => (
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
