"use client";

import { useState } from "react";
import { createModuleResource, deleteModuleResource } from "@/app/actions/module-resources";
import { toast } from "sonner";
import { ExternalLink, Trash2 } from "lucide-react";

type Resource = {
  id: string;
  title: string;
  type: string;
  url: string;
};

export default function ResourcesList({
  moduleId,
  moduleSlug: _moduleSlug,
  initialResources,
}: {
  moduleId: string;
  moduleSlug: string;
  initialResources: Resource[];
}) {
  const [resources, setResources] = useState(initialResources);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"link" | "pdf" | "file">("link");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      toast.error("Title and URL are required");
      return;
    }
    setLoading(true);
    const result = await createModuleResource(moduleId, { title: title.trim(), type, url: url.trim() });
    setLoading(false);
    if (result.success) {
      setTitle("");
      setUrl("");
      toast.success("Resource added");
      window.location.reload();
    } else {
      toast.error(result.error ?? "Failed to add");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this resource?")) return;
    setLoading(true);
    const result = await deleteModuleResource(id, moduleId);
    setLoading(false);
    if (result.success) {
      setResources((prev) => prev.filter((r) => r.id !== id));
      toast.success("Resource removed");
    } else {
      toast.error(result.error ?? "Failed to remove");
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={handleAdd} className="rounded-xl border border-green-soft bg-light-green/30 p-4">
        <h3 className="font-medium text-deep-green/90">Add resource</h3>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm"
          />
          <input
            type="url"
            placeholder="URL (https://...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "link" | "pdf" | "file")}
            className="min-h-[44px] rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm"
          >
            <option value="link">Link</option>
            <option value="pdf">PDF</option>
            <option value="file">File</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white hover:bg-gold-hover disabled:opacity-60"
          >
            Add
          </button>
        </div>
      </form>

      {resources.length === 0 ? (
        <p className="text-sm text-foreground/70">No resources yet. Add links or files for students.</p>
      ) : (
        <ul className="space-y-2">
          {resources.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-green-soft bg-[var(--background)] px-4 py-3"
            >
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center gap-2 text-sm font-medium text-deep-green hover:underline"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                {r.title}
                <span className="rounded bg-light-green/60 px-1.5 py-0.5 text-xs text-foreground/70">{r.type}</span>
              </a>
              <button
                type="button"
                onClick={() => handleDelete(r.id)}
                disabled={loading}
                className="rounded p-2 text-foreground/60 hover:bg-red-500/10 hover:text-red-600 disabled:opacity-60"
                aria-label="Remove resource"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
