"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPlatformEvent, updatePlatformEvent } from "@/app/actions/platform-events";
import { toast } from "sonner";

type Props = {
  id?: string;
  initial?: {
    title: string;
    description: string;
    event_date: string;
    event_time: string;
    location: string;
    url: string;
  };
};

export default function EventForm({ id, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [event_date, setEventDate] = useState(initial?.event_date ?? "");
  const [event_time, setEventTime] = useState(initial?.event_time ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !event_date) {
      toast.error("Title and date are required");
      return;
    }
    setLoading(true);
    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      event_date,
      event_time: event_time.trim() || undefined,
      location: location.trim() || undefined,
      url: url.trim() || undefined,
    };
    const result = id
      ? await updatePlatformEvent(id, data)
      : await createPlatformEvent(data);
    setLoading(false);
    if (result.success) {
      toast.success(id ? "Updated" : "Created");
      router.push("/admin/events");
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
        <label htmlFor="event_date" className="block text-sm font-medium text-deep-green/90">Date</label>
        <input
          id="event_date"
          type="date"
          value={event_date}
          onChange={(e) => setEventDate(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="event_time" className="block text-sm font-medium text-deep-green/90">Time (optional)</label>
        <input
          id="event_time"
          type="time"
          value={event_time}
          onChange={(e) => setEventTime(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-deep-green/90">Location (optional)</label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-deep-green/90">URL (optional)</label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2"
          placeholder="https://..."
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-deep-green/90">Description (optional)</label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
