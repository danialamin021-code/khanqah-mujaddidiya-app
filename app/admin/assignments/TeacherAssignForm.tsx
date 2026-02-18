"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignTeacher } from "@/lib/actions/module-teachers";
import type { ModuleRow } from "@/lib/data/modules";

export default function TeacherAssignForm({
  moduleSlug,
  modules,
  teachers,
  assignedTeacherIds = [],
}: {
  moduleSlug: string;
  modules: ModuleRow[];
  teachers: { id: string; fullName: string; email?: string }[];
  assignedTeacherIds?: string[];
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const module = modules.find((m) => m.slug === moduleSlug);
  if (!module) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const userId = (form.elements.namedItem("userId") as HTMLSelectElement)?.value;
    if (!userId) return;
    startTransition(async () => {
      if (!module) return;
      const res = await assignTeacher(module.id, userId);
      if (res?.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-heading text-lg font-normal text-deep-green">
        Assign teacher to {module.title}
      </h3>
      <div>
        <label className="block text-sm font-medium text-deep-green/90">Teacher</label>
        <select
          name="userId"
          required
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm text-foreground"
        >
          <option value="">Select a teacher</option>
          {teachers
            .filter((t) => !assignedTeacherIds.includes(t.id))
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName} {t.email ? `(${t.email})` : ""}
              </option>
            ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-hover disabled:opacity-60"
      >
        {pending ? "Assigning…" : "Assign"}
      </button>
    </form>
  );
}
