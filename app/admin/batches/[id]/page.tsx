import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBatchById } from "@/lib/data/batches";
import BatchEditForm from "./BatchEditForm";

export default async function AdminBatchEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();

  const [batch, modulesRes, teachersRes] = await Promise.all([
    getBatchById(id),
    supabase.from("modules").select("id, title").eq("is_archived", false).order("sort_order"),
    supabase.from("profiles").select("id, full_name").contains("roles", ["teacher"]),
  ]);

  if (!batch) notFound();

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
      <h1 className="mt-6 font-heading text-2xl font-normal text-deep-green">Edit Batch</h1>
      <p className="mt-2 text-sm text-foreground/70">{batch.name}</p>
      <BatchEditForm
        batch={batch}
        modules={modules}
        teachers={teachers}
      />
    </div>
  );
}
