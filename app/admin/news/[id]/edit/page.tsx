import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import NewsForm from "../../NewsForm";

export default async function AdminNewsEditPage({
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
    .from("platform_news")
    .select("id, title, excerpt, body")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return (
    <div>
      <Link href="/admin/news" className="text-sm font-medium text-deep-green/80 hover:text-deep-green">
        ← News
      </Link>
      <h1 className="font-heading mt-4 text-2xl font-normal text-deep-green">
        Edit article
      </h1>
      <NewsForm
        id={id}
        initial={{
          title: (data as { title: string }).title,
          excerpt: (data as { excerpt: string }).excerpt,
          body: (data as { body: string }).body,
        }}
      />
    </div>
  );
}
