"use client";

import { useState } from "react";
import { useRealtimeModule } from "@/lib/hooks/use-realtime-module";
import { useUser } from "@/lib/hooks/use-user";
import { createModuleSession, deleteModuleSession } from "@/lib/actions/module-sessions";
import { useTransition } from "react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

interface SessionRow {
  id: string;
  date: string;
  time: string | null;
  topic: string | null;
  zoom_link: string | null;
  status: string;
}

export default function SessionsList({
  moduleId,
  moduleSlug,
  initialSessions,
}: {
  moduleId: string;
  moduleSlug: string;
  initialSessions: SessionRow[];
}) {
  const { user } = useUser();
  const { sessions } = useRealtimeModule(moduleId, user?.id ?? null);
  const list = sessions.length > 0 ? sessions : initialSessions;
  const [pending, startTransition] = useTransition();
  const [deleteSession, setDeleteSession] = useState<SessionRow | null>(null);

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const date = (form.elements.namedItem("date") as HTMLInputElement)?.value;
    const time = (form.elements.namedItem("time") as HTMLInputElement)?.value || undefined;
    const topic = (form.elements.namedItem("topic") as HTMLInputElement)?.value || undefined;
    const zoomLink = (form.elements.namedItem("zoom_link") as HTMLInputElement)?.value || undefined;
    if (!date) return;
    startTransition(async () => {
      const res = await createModuleSession(moduleId, { date, time, topic, zoom_link: zoomLink });
      if (res?.error) {
        alert(res.error);
        return;
      }
      form.reset();
    });
  }

  async function handleConfirmDelete() {
    if (!deleteSession) return;
    const res = await deleteModuleSession(deleteSession.id);
    if (res?.error) {
      alert(res.error);
      throw new Error(res.error);
    }
    setDeleteSession(null);
  }

  return (
    <div className="mt-6 space-y-6">
      <DeleteConfirmModal
        isOpen={!!deleteSession}
        onClose={() => setDeleteSession(null)}
        onConfirm={handleConfirmDelete}
        title="Archive Session"
        description={
          deleteSession
            ? `Archive the session on ${deleteSession.date}${deleteSession.topic ? ` (${deleteSession.topic})` : ""}?`
            : ""
        }
        confirmLabel="Archive"
      />
      <form onSubmit={handleCreate} className="rounded-xl border border-green-soft bg-[var(--background)] p-4">
        <h3 className="font-heading text-sm font-normal text-deep-green">Add session</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          <input
            name="date"
            type="date"
            required
            className="rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm"
          />
          <input
            name="time"
            type="time"
            className="rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm"
          />
          <input
            name="topic"
            type="text"
            placeholder="Topic"
            className="rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm"
          />
          <input
            name="zoom_link"
            type="url"
            placeholder="Zoom link"
            className="rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm min-w-[200px]"
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
        <p className="text-sm text-foreground/70">No sessions yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-green-soft">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-green-soft bg-light-green/60">
                <th className="px-4 py-3 text-left font-medium text-deep-green">Date</th>
                <th className="px-4 py-3 text-left font-medium text-deep-green">Time</th>
                <th className="px-4 py-3 text-left font-medium text-deep-green">Topic</th>
                <th className="px-4 py-3 text-left font-medium text-deep-green">Status</th>
                <th className="px-4 py-3 text-left font-medium text-deep-green">Link</th>
                <th className="px-4 py-3 text-right font-medium text-deep-green">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--background)]">
              {list.map((s) => (
                <tr key={s.id} className="border-b border-green-soft/80 last:border-0">
                  <td className="px-4 py-3 text-foreground/90">{s.date}</td>
                  <td className="px-4 py-3 text-foreground/90">{s.time ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground/90">{s.topic ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={` rounded px-2 py-0.5 text-xs font-medium ${
                        s.status === "live"
                          ? "bg-green-600/20 text-green-700 dark:text-green-400"
                          : s.status === "completed"
                            ? "bg-foreground/10 text-foreground/70"
                            : "bg-muted-gold/20 text-muted-gold"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.zoom_link ? (
                      <a
                        href={s.zoom_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-deep-green hover:underline"
                      >
                        Join
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setDeleteSession(s)}
                      className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
