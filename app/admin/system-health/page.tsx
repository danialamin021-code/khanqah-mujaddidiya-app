import Link from "next/link";
import { getSystemHealth } from "@/lib/data/admin-analytics";

/**
 * System health — total users, modules, enrollments, logs, last activity, director count.
 * Accessible only by admin/director (enforced by layout).
 */
export default async function AdminSystemHealthPage() {
  const health = await getSystemHealth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          System Health
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Platform metrics and activity overview.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
          <p className="text-sm font-medium text-deep-green/90">Total Users</p>
          <p className="mt-1 text-2xl font-heading text-deep-green">{health.totalUsers}</p>
        </div>
        <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
          <p className="text-sm font-medium text-deep-green/90">Total Modules</p>
          <p className="mt-1 text-2xl font-heading text-deep-green">{health.totalModules}</p>
        </div>
        <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
          <p className="text-sm font-medium text-deep-green/90">Total Enrollments</p>
          <p className="mt-1 text-2xl font-heading text-deep-green">{health.totalEnrollments}</p>
        </div>
        <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
          <p className="text-sm font-medium text-deep-green/90">Total Logs</p>
          <p className="mt-1 text-2xl font-heading text-deep-green">{health.totalLogs}</p>
        </div>
        <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
          <p className="text-sm font-medium text-deep-green/90">Director Count</p>
          <p className="mt-1 text-2xl font-heading text-deep-green">{health.directorCount}</p>
        </div>
        <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
          <p className="text-sm font-medium text-deep-green/90">Last Activity</p>
          <p className="mt-1 text-lg font-heading text-deep-green">
            {health.lastActivityTimestamp
              ? new Date(health.lastActivityTimestamp).toLocaleString()
              : "—"}
          </p>
        </div>
      </section>

      <Link
        href="/admin"
        className="inline-block text-sm font-medium text-deep-green hover:underline"
      >
        ← Admin Home
      </Link>
    </div>
  );
}
