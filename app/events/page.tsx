import Link from "next/link";
import { getUpcomingEvents } from "@/lib/data/platform-events";

export default async function EventsPage() {
  const events = await getUpcomingEvents(20);

  return (
    <main className="min-h-full px-4 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/home" className="text-sm font-medium text-deep-green/80 hover:text-deep-green">
          ← Home
        </Link>
        <h1 className="font-heading mt-4 text-2xl font-normal text-deep-green">
          Events
        </h1>
        <p className="mt-2 text-foreground/80">
          Upcoming events and gatherings.
        </p>

        {events.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <p className="text-foreground/80">
              No upcoming events at the moment. Check back later or reach out via{" "}
              <Link href="/contact" className="font-medium text-deep-green hover:underline">
                Contact
              </Link>{" "}
              for more information.
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {events.map((e) => (
              <li
                key={e.id}
                className="rounded-2xl border border-green-soft bg-light-green/50 p-5"
              >
                <h2 className="font-heading text-lg font-normal text-deep-green">
                  {e.title}
                </h2>
                <p className="mt-1 text-sm text-foreground/70">
                  {new Date(e.event_date).toLocaleDateString("en", { weekday: "long", dateStyle: "long" })}
                  {e.event_time && ` · ${String(e.event_time).slice(0, 5)}`}
                </p>
                {e.location && (
                  <p className="mt-1 text-sm text-foreground/70">{e.location}</p>
                )}
                {e.description && (
                  <p className="mt-2 text-sm text-foreground/80">{e.description}</p>
                )}
                {e.url && (
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-deep-green hover:underline"
                  >
                    More details →
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
