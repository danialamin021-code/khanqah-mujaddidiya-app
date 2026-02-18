import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import RoleApprovalActions from "./RoleApprovalActions";

export default async function AdminApprovalsPage() {
  const canAccess = await requireAdmin();
  if (!canAccess) redirect("/home");

  const supabase = await createClient();
  if (!supabase) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-normal text-deep-green">Pending Approvals</h1>
        <p className="mt-2 text-sm text-foreground/60">Supabase not configured.</p>
      </div>
    );
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, role_request, email")
    .in("role_request", ["pending_teacher", "pending_admin"]);

  const pending = profiles ?? [];
  const pendingTeacher = pending.filter((p) => (p as { role_request?: string }).role_request === "pending_teacher");
  const pendingAdmin = pending.filter((p) => (p as { role_request?: string }).role_request === "pending_admin");

  return (
    <div>
      <h1 className="font-heading text-2xl font-normal text-deep-green">
        Pending Approvals
      </h1>
      <p className="mt-2 text-sm text-foreground/70">
        Approve or reject Teacher and Admin role requests.
      </p>

      {pending.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-green-soft bg-light-green/50 p-6">
          <p className="text-foreground/80">No pending approvals.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {pendingTeacher.length > 0 && (
            <section>
              <h2 className="font-heading text-lg font-normal text-deep-green">Teacher Requests</h2>
              <ul className="mt-3 space-y-3">
                {pendingTeacher.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-soft bg-light-green/30 px-4 py-3"
                  >
                    <span className="text-sm text-foreground/90">
                      {(p as { email?: string }).email ?? p.id}
                    </span>
                    <RoleApprovalActions userId={p.id} requestType="pending_teacher" />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {pendingAdmin.length > 0 && (
            <section>
              <h2 className="font-heading text-lg font-normal text-deep-green">Admin Requests</h2>
              <ul className="mt-3 space-y-3">
                {pendingAdmin.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-soft bg-light-green/30 px-4 py-3"
                  >
                    <span className="text-sm text-foreground/90">
                      {(p as { email?: string }).email ?? p.id}
                    </span>
                    <RoleApprovalActions userId={p.id} requestType="pending_admin" />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <Link
        href="/admin"
        className="mt-6 inline-block text-sm font-medium text-deep-green hover:underline"
      >
        ← Admin
      </Link>
    </div>
  );
}
