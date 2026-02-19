import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminNewsPage() {
  const canAccess = await requireAdmin();
  if (!canAccess) redirect("/home");

  const supabase = await createClient();
  const { data: items } = supabase
    ? await supabase
        .from("platform_news")
        .select("id, title, excerpt, published_at")
        .order("published_at", { ascending: false })
        .limit(50)
    : { data: [] };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          Platform News
        </h1>
        <Link
          href="/admin/news/new"
          className="rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
        >
          New article
        </Link>
      </div>
      <p className="mt-2 text-sm text-foreground/70">
        News & Updates shown on Home. Anyone can read.
      </p>
      {!items?.length ? (
        <div className="mt-8 rounded-2xl border border-green-soft bg-light-green/50 p-6">
          <p className="text-foreground/80">No news yet. Create one to show on Home.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((i) => (
            <li
              key={i.id}
              className="flex items-center justify-between rounded-xl border border-green-soft bg-light-green/30 px-4 py-3"
            >
              <div>
                <p className="font-medium text-deep-green/90">{(i as { title: string }).title}</p>
                <p className="text-xs text-foreground/60">
                  {new Date((i as { published_at: string }).published_at).toLocaleDateString("en")}
                </p>
              </div>
              <Link
                href={`/admin/news/${i.id}/edit`}
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
