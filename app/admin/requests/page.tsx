import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import RequestsList from "./RequestsList";

export default async function AdminRequestsPage() {
  const canAccess = await requireAdmin();
  if (!canAccess) redirect("/home");

  const supabase = await createClient();
  if (!supabase) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-normal text-deep-green">Bayat & Guidance Requests</h1>
        <p className="mt-2 text-sm text-foreground/60">Supabase not configured.</p>
      </div>
    );
  }

  const [bayatRes, guidanceRes] = await Promise.all([
    supabase
      .from("bayat_requests")
      .select("id, full_name, whatsapp, country, city, status, submitted_at")
      .order("submitted_at", { ascending: false })
      .limit(50),
    supabase
      .from("guidance_requests")
      .select("id, full_name, whatsapp, country, city, message, status, submitted_at")
      .order("submitted_at", { ascending: false })
      .limit(50),
  ]);

  const bayatRequests = (bayatRes.data ?? []) as {
    id: string;
    full_name: string;
    whatsapp: string;
    country: string | null;
    city: string | null;
    status: string;
    submitted_at: string;
  }[];
  const guidanceRequests = (guidanceRes.data ?? []) as {
    id: string;
    full_name: string;
    whatsapp: string;
    country: string | null;
    city: string | null;
    message: string | null;
    status: string;
    submitted_at: string;
  }[];

  return (
    <div>
      <h1 className="font-heading text-2xl font-normal text-deep-green">
        Bayat & Guidance Requests
      </h1>
      <p className="mt-2 text-sm text-foreground/70">
        Review and respond to Bayat and Guidance requests. All human-reviewed.
      </p>

      <RequestsList
        bayatRequests={bayatRequests}
        guidanceRequests={guidanceRequests}
      />
    </div>
  );
}
