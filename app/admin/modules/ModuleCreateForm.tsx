"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createModule } from "@/lib/actions/modules";

export default function ModuleCreateForm({
  onCancel,
  existingSlugs,
}: {
  onCancel: () => void;
  existingSlugs: string[];
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const slug = (form.elements.namedItem("slug") as HTMLInputElement)?.value?.trim();
    if (existingSlugs.includes(slug ?? "")) {
      alert("A module with this slug already exists.");
      return;
    }
    startTransition(async () => {
      const fd = new FormData(form);
      const res = await createModule(fd);
      if (res?.error) {
        alert(res.error);
        return;
      }
      router.push("/admin/modules");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-heading text-lg font-normal text-deep-green">New Module</h3>
      <div>
        <label className="block text-sm font-medium text-deep-green/90">Slug</label>
        <input
          name="slug"
          type="text"
          required
          placeholder="e.g. tafseer"
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm text-foreground"
        />
        <p className="mt-0.5 text-xs text-foreground/60">
          Lowercase, no spaces. Used in URLs.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-deep-green/90">Title</label>
        <input
          name="title"
          type="text"
          required
          placeholder="e.g. Tafseer"
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm text-foreground"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-deep-green/90">Description</label>
        <textarea
          name="description"
          rows={3}
          placeholder="Optional description"
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm text-foreground"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-hover disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => {
            router.push("/admin/modules");
            router.refresh();
          }}
          className="rounded-lg border border-green-soft px-4 py-2 text-sm font-medium text-deep-green transition-colors hover:bg-light-green/50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
