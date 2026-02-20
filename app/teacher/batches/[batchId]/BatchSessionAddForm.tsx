"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBatchSession } from "@/app/actions/batch-management";

export default function BatchSessionAddForm({ batchId }: { batchId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [topic, setTopic] = useState("");
  const [zoomLink, setZoomLink] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await createBatchSession({
        batchId,
        title,
        sessionDate,
        topic: topic || undefined,
        zoomLink: zoomLink || undefined,
      });
      if (result.success) {
        setOpen(false);
        setTitle("");
        setSessionDate("");
        setTopic("");
        setZoomLink("");
        router.refresh();
      } else {
        setError(result.error ?? "Failed to create session");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-green-soft px-4 py-2 text-sm font-medium text-deep-green hover:bg-light-green/50"
      >
        Add Session
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-xl border border-green-soft bg-light-green/30 p-4">
      <h3 className="font-heading text-sm font-normal text-deep-green">New Session</h3>
      <div>
        <label className="block text-sm font-medium text-deep-green/90">Title *</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-deep-green/90">Date *</label>
        <input
          type="date"
          required
          value={sessionDate}
          onChange={(e) => setSessionDate(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-deep-green/90">Topic</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-deep-green/90">Zoom Link</label>
        <input
          type="url"
          value={zoomLink}
          onChange={(e) => setZoomLink(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white hover:bg-gold-hover disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-green-soft px-4 py-2 text-sm font-medium text-deep-green hover:bg-light-green/50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
