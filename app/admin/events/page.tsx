import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function AdminEventsPage() {
  const canAccess = await requireAdmin();
  if (!canAccess) redirect("/home");

  const supabase = await createClient();
  const { data: events } = supabase
    ? await supabase
        .from("platform_events")
        .select("id, title, event_date, event_time, location")
        .order("event_date", { ascending: true })
        .limit(50)
    : { data: [] };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          Events
        </h1>
        <Link
          href="/admin/events/new"
          className="rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
        >
          New event
        </Link>
      </div>
      <p className="mt-2 text-sm text-foreground/70">
        Upcoming events shown on /events.
      </p>
      {!events?.length ? (
        <div className="mt-8 rounded-2xl border border-green-soft bg-light-green/50 p-6">
          <p className="text-foreground/80">No events yet.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {events.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between rounded-xl border border-green-soft bg-light-green/30 px-4 py-3"
            >
              <div>
                <p className="font-medium text-deep-green/90">{(e as { title: string }).title}</p>
                <p className="text-xs text-foreground/60">
                  {(e as { event_date: string }).event_date}
                  {(e as { event_time: string | null }).event_time && ` · ${String((e as { event_time: string }).event_time).slice(0, 5)}`}
                  {(e as { location: string | null }).location && ` · ${(e as { location: string }).location}`}
                </p>
              </div>
              <Link
                href={`/admin/events/${e.id}/edit`}
                className="text-sm font-medium text-deep-green hover:underline"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
