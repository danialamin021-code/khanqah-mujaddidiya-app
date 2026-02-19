import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import EventForm from "../../EventForm";

export default async function AdminEventsEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const canAccess = await requireAdmin();
  if (!canAccess) redirect("/home");

  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();

  const { data } = await supabase
    .from("platform_events")
    .select("id, title, description, event_date, event_time, location, url")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const d = data as {
    title: string;
    description: string | null;
    event_date: string;
    event_time: string | null;
    location: string | null;
    url: string | null;
  };

  return (
    <div>
      <Link href="/admin/events" className="text-sm font-medium text-deep-green/80 hover:text-deep-green">
        ← Events
      </Link>
      <h1 className="font-heading mt-4 text-2xl font-normal text-deep-green">
        Edit event
      </h1>
      <EventForm
        id={id}
        initial={{
          title: d.title,
          description: d.description ?? "",
          event_date: d.event_date,
          event_time: d.event_time ? String(d.event_time).slice(0, 5) : "",
          location: d.location ?? "",
          url: d.url ?? "",
        }}
      />
    </div>
  );
}
