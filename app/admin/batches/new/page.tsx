import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BatchCreateForm from "./BatchCreateForm";

export default async function AdminBatchNewPage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-normal text-deep-green">Create Batch</h1>
        <p className="mt-2 text-sm text-foreground/70">Unable to load.</p>
      </div>
    );
  }

  const [modulesRes, teachersRes] = await Promise.all([
    supabase.from("modules").select("id, title").eq("is_archived", false).order("sort_order"),
    supabase.from("profiles").select("id, full_name").contains("roles", ["teacher"]),
  ]);

  const modules = (modulesRes.data ?? []) as { id: string; title: string }[];
  const teachers = (teachersRes.data ?? []) as { id: string; full_name: string | null }[];

  return (
    <div>
      <Link
        href="/admin/batches"
        className="text-sm font-medium text-deep-green/80 hover:text-deep-green"
      >
        ← Batch Management
      </Link>
      <h1 className="mt-6 font-heading text-2xl font-normal text-deep-green">Create Batch</h1>
      <p className="mt-2 text-sm text-foreground/70">
        Create a new academic batch. Assign a teacher and add WhatsApp group link.
      </p>
      <BatchCreateForm modules={modules} teachers={teachers} />
    </div>
  );
}
