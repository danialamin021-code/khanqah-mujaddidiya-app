import Link from "next/link";
import { getActivityLogs } from "@/lib/data/admin-analytics";

/**
 * Activity logs — admin/director only (enforced by layout + RLS).
 */
export default async function AdminActivityLogsPage() {
  const logs = await getActivityLogs();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          Activity Logs
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Audit trail of critical platform actions.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-green-soft bg-light-green/30">
        {logs.length === 0 ? (
          <p className="p-8 text-center text-sm text-foreground/70">
            No activity logs yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-soft bg-light-green/60">
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Time</th>
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Actor Role</th>
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Action</th>
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Entity</th>
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Description</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--background)]">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-green-soft/80 last:border-0"
                  >
                    <td className="px-4 py-3 text-foreground/80 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-foreground/90">{log.actor_role ?? "—"}</td>
                    <td className="px-4 py-3 text-foreground/90">{log.action_type}</td>
                    <td className="px-4 py-3 text-foreground/90">{log.entity_type}</td>
                    <td className="px-4 py-3 text-foreground/80 max-w-xs truncate">
                      {log.description ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Link
        href="/admin"
        className="inline-block text-sm font-medium text-deep-green hover:underline"
      >
        ← Admin Home
      </Link>
    </div>
  );
}
