"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBatch } from "@/app/actions/batch-management";

export default function BatchCreateForm({
  modules,
  teachers,
}: {
  modules: { id: string; title: string }[];
  teachers: { id: string; full_name: string | null }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [moduleId, setModuleId] = useState(modules[0]?.id ?? "");
  const [teacherId, setTeacherId] = useState("");
  const [whatsappGroupLink, setWhatsappGroupLink] = useState("");
  const [price, setPrice] = useState(0);
  const [isPaid, setIsPaid] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await createBatch({
        moduleId,
        name,
        description: description || undefined,
        teacherId: teacherId || undefined,
        whatsappGroupLink: whatsappGroupLink || undefined,
        price,
        isPaid,
      });
      if (result.success && result.batchId) {
        router.push(`/admin/batches/${result.batchId}`);
        router.refresh();
      } else {
        setError(result.error ?? "Failed to create batch");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
      <div>
        <label className="block text-sm font-medium text-deep-green/90">Module *</label>
        <select
          required
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground"
        >
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-deep-green/90">Batch Name *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground"
          placeholder="e.g. Tafseer Batch 2025"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-deep-green/90">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-deep-green/90">Teacher</label>
        <select
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground"
        >
          <option value="">— Select teacher —</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.full_name ?? t.id}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-deep-green/90">WhatsApp Group Link</label>
        <input
          type="url"
          value={whatsappGroupLink}
          onChange={(e) => setWhatsappGroupLink(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground"
          placeholder="https://chat.whatsapp.com/..."
        />
      </div>
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-deep-green/90">Price (PKR)</label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
            className="mt-1 w-32 rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground"
          />
        </div>
        <div className="flex items-end gap-2">
          <input
            type="checkbox"
            id="isPaid"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
            className="h-4 w-4 rounded border-green-soft text-muted-gold"
          />
          <label htmlFor="isPaid" className="text-sm text-deep-green/90">
            Paid batch
          </label>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white hover:bg-gold-hover disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create Batch"}
        </button>
        <Link
          href="/admin/batches"
          className="rounded-lg border border-green-soft px-4 py-2 text-sm font-medium text-deep-green hover:bg-light-green/50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
