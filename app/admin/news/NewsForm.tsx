"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPlatformNews } from "@/app/actions/platform-news";
import { toast } from "sonner";

export default function NewsForm({
  initial,
  id,
}: {
  initial?: { title: string; excerpt: string; body: string };
  id?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setLoading(true);
    const result = id
      ? await import("@/app/actions/platform-news").then((m) => m.updatePlatformNews(id, { title: title.trim(), excerpt: excerpt.trim(), body: body.trim() }))
      : await createPlatformNews({ title: title.trim(), excerpt: excerpt.trim(), body: body.trim() });
    setLoading(false);
    if (result.success) {
      toast.success(id ? "Updated" : "Created");
      router.push("/admin/news");
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-deep-green/90">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-deep-green/90">Excerpt</label>
        <input
          id="excerpt"
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2"
          placeholder="Short summary for list view"
        />
      </div>
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-deep-green/90">Body</label>
        <textarea
          id="body"
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-muted-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-hover disabled:opacity-60"
      >
        {loading ? "Saving…" : id ? "Update" : "Create"}
      </button>
    </form>
  );
}
