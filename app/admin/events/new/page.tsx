import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import EventForm from "../EventForm";

export default async function AdminEventsNewPage() {
  const canAccess = await requireAdmin();
  if (!canAccess) redirect("/home");

  return (
    <div>
      <h1 className="font-heading text-2xl font-normal text-deep-green">
        New event
      </h1>
      <p className="mt-2 text-sm text-foreground/70">
        This will appear on the Events page.
      </p>
      <EventForm />
    </div>
  );
}
