"use client";

import { useRealtimeModule } from "@/lib/hooks/use-realtime-module";
import { useUser } from "@/lib/hooks/use-user";
import { createModuleAnnouncement } from "@/lib/actions/module-announcements";
import { useTransition } from "react";

interface AnnRow {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

export default function AnnouncementsList({
  moduleId,
  initialAnnouncements,
}: {
  moduleId: string;
  initialAnnouncements: AnnRow[];
}) {
  const { user } = useUser();
  const { announcements } = useRealtimeModule(moduleId, user?.id ?? null);
  const list = announcements.length > 0 ? announcements : initialAnnouncements;
  const [pending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement)?.value?.trim();
    const content = (form.elements.namedItem("content") as HTMLTextAreaElement)?.value?.trim() ?? "";
    if (!title) return;
    startTransition(async () => {
      const res = await createModuleAnnouncement(moduleId, { title, content });
      if (res?.error) {
        alert(res.error);
        return;
      }
      form.reset();
    });
  }

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={handleCreate} className="rounded-xl border border-green-soft bg-[var(--background)] p-4">
        <h3 className="font-heading text-sm font-normal text-deep-green">Add announcement</h3>
        <div className="mt-3 space-y-3">
          <input
            name="title"
            type="text"
            required
            placeholder="Title"
            className="w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm"
          />
          <textarea
            name="content"
            rows={3}
            placeholder="Content (optional)"
            className="w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white hover:bg-gold-hover disabled:opacity-60"
          >
            {pending ? "Adding…" : "Add"}
          </button>
        </div>
      </form>

      {list.length === 0 ? (
        <p className="text-sm text-foreground/70">No announcements yet.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-green-soft bg-[var(--background)] p-4"
            >
              <p className="font-medium text-deep-green/90">{a.title}</p>
              {a.content && (
                <p className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">{a.content}</p>
              )}
              <p className="mt-2 text-xs text-foreground/60">
                {new Date(a.updated_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
