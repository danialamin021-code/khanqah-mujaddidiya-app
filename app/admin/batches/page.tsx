import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllActiveBatches } from "@/lib/data/batches";
import { getParticipationAlerts } from "@/lib/data/admin-batches";

/**
 * Admin — Batch Management. Create/edit/archive batches, assign teacher, WhatsApp link, pricing.
 * View-only attendance monitor per batch.
 */
export default async function AdminBatchesPage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-normal text-deep-green">Batch Management</h1>
        <p className="mt-2 text-sm text-foreground/70">Unable to load.</p>
      </div>
    );
  }

  const [batchesData, alertsData] = await Promise.all([
    getAllActiveBatches(1),
    getParticipationAlerts(1, 25),
  ]);

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title")
    .eq("is_archived", false);

  const moduleMap = new Map((modules ?? []).map((m) => [(m as { id: string }).id, (m as { title: string }).title]));
  const batchesByModule = new Map<string, typeof batchesData.batches>();
  for (const b of batchesData.batches) {
    const list = batchesByModule.get(b.module_id) ?? [];
    list.push(b);
    batchesByModule.set(b.module_id, list);
  }

  const moduleList = (modules ?? []) as { id: string; title: string }[];
  const moduleIdsWithBatches = new Set(batchesByModule.keys());
  const orderedModuleIds = [
    ...moduleList.filter((m) => moduleIdsWithBatches.has(m.id)).map((m) => m.id),
    ...Array.from(moduleIdsWithBatches).filter((id) => !moduleList.some((m) => m.id === id)),
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-normal text-deep-green">Batch Management</h1>
        <p className="mt-2 text-sm text-foreground/70">
          Create, edit, archive batches. Assign teachers, add WhatsApp links, set pricing.
        </p>
        <Link
          href="/admin/batches/new"
          className="mt-4 inline-block rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
        >
          Create Batch
        </Link>
      </div>

      <section className="rounded-2xl border border-green-soft bg-light-green/30 p-6">
        <h2 className="font-heading text-lg font-normal text-deep-green">Active Batches</h2>
        {batchesData.batches.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/70">No batches yet.</p>
        ) : (
          <div className="mt-6 space-y-6">
            {orderedModuleIds.map((moduleId) => {
              const modBatches = batchesByModule.get(moduleId) ?? [];
              const moduleTitle = moduleMap.get(moduleId) ?? "Other";
              return (
                <div key={moduleId} className="rounded-xl border border-green-soft/60 bg-[var(--background)] p-4">
                  <h3 className="font-heading text-base font-normal text-deep-green">{moduleTitle}</h3>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-green-soft/60">
                          <th className="px-4 py-2 text-left font-medium text-deep-green/90">Batch</th>
                          <th className="px-4 py-2 text-left font-medium text-deep-green/90">Teacher</th>
                          <th className="px-4 py-2 text-left font-medium text-deep-green/90">WhatsApp</th>
                          <th className="px-4 py-2 text-left font-medium text-deep-green/90">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modBatches.map((b) => (
                          <tr key={b.id} className="border-b border-green-soft/40 last:border-0">
                            <td className="px-4 py-2 font-medium text-deep-green/90">{b.name}</td>
                            <td className="px-4 py-2 text-foreground/90">{b.teacher_id ? "Assigned" : "—"}</td>
                            <td className="px-4 py-2 text-foreground/90">{b.whatsapp_group_link ? "Yes" : "—"}</td>
                            <td className="px-4 py-2">
                              <Link
                                href={`/admin/batches/${b.id}`}
                                className="text-sm font-medium text-deep-green hover:underline"
                              >
                                Edit
                              </Link>
                              <span className="mx-2 text-foreground/50">|</span>
                              <Link
                                href={`/teacher/batches/${b.id}`}
                                className="text-sm font-medium text-deep-green hover:underline"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
            {batchesData.totalCount > batchesData.batches.length && (
              <p className="text-xs text-foreground/70">
                Showing {batchesData.batches.length} of {batchesData.totalCount}
              </p>
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6">
        <h2 className="font-heading text-lg font-normal text-amber-800 dark:text-amber-200">
          Participation Alerts (Below 50%)
        </h2>
        {alertsData.alerts.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/70">No students below 50% attendance.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-500/40">
                  <th className="px-4 py-3 text-left font-medium text-amber-800 dark:text-amber-200">Student</th>
                  <th className="px-4 py-3 text-left font-medium text-amber-800 dark:text-amber-200">Batch</th>
                  <th className="px-4 py-3 text-left font-medium text-amber-800 dark:text-amber-200">Attendance</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--background)]">
                {alertsData.alerts.map((a, i) => (
                  <tr key={i} className="border-b border-amber-500/30 last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground/90">{a.fullName ?? "—"}</td>
                    <td className="px-4 py-3 text-foreground/90">{a.batchName}</td>
                    <td className="px-4 py-3">
                      <span className="rounded px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-700 dark:text-red-400">
                        {a.attendancePercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
