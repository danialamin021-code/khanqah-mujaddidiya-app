import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { canAssignRoles } from "@/lib/permissions";
import { getUserRoles } from "@/lib/auth";
import UserManagementTable from "@/components/admin/UserManagementTable";
import RoleEditForm from "@/components/admin/RoleEditForm";
import type { Role } from "@/lib/constants/permissions";

/**
 * User management — view users, search/filter, edit roles.
 * Director can assign admin/teacher; Admin can assign teacher.
 */
const USERS_PAGE_SIZE = 50;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; edit?: string; page?: string }>;
}) {
  const params = await searchParams;
  const roleParam = params.role as "student" | "teacher" | "admin" | "director" | undefined;
  const editUserId = params.edit;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const initialRole = roleParam && ["student", "teacher", "admin", "director"].includes(roleParam)
    ? roleParam
    : "all";
  const roles = await getUserRoles();
  const canAssign = canAssignRoles(roles);
  const canAssignTeacher = roles.includes("admin") || roles.includes("director");

  const supabase = await createClient();
  let profiles: { id: string; email?: string | null; full_name?: string | null; roles: string[]; role_request?: string | null }[] = [];

  let totalCount = 0;
  if (supabase) {
    try {
      const from = (page - 1) * USERS_PAGE_SIZE;
      const to = from + USERS_PAGE_SIZE - 1;
      const [profilesRes, countRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, email, full_name, roles, role_request")
          .order("created_at", { ascending: false })
          .range(from, to),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      profiles = (profilesRes.data ?? []).map((p) => ({
        id: (p as { id: string }).id,
        email: (p as { email?: string | null }).email,
        full_name: (p as { full_name?: string | null }).full_name,
        roles: ((p as { roles?: string[] }).roles ?? []).filter(Boolean),
        role_request: (p as { role_request?: string | null }).role_request,
      }));
      totalCount = countRes.count ?? 0;
    } catch {
      profiles = [];
    }
  }
  const totalPages = Math.max(1, Math.ceil(totalCount / USERS_PAGE_SIZE));
  let userToEdit = editUserId ? profiles.find((p) => p.id === editUserId) : null;
  if (editUserId && !userToEdit && supabase) {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, roles, role_request")
      .eq("id", editUserId)
      .single();
    if (data) {
      userToEdit = {
        id: (data as { id: string }).id,
        email: (data as { email?: string | null }).email,
        full_name: (data as { full_name?: string | null }).full_name,
        roles: ((data as { roles?: string[] }).roles ?? []).filter(Boolean),
        role_request: (data as { role_request?: string | null }).role_request,
      };
    }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-normal text-deep-green">
        User Management
      </h1>
      <p className="mt-2 text-sm text-foreground/70">
        View, search, and manage users. {canAssign ? "Director can assign Admin role." : "Admin can assign Teacher role."}
      </p>

      {userToEdit && (
        <div className="mt-6">
          <RoleEditForm
            userId={userToEdit.id}
            userName={userToEdit.full_name ?? userToEdit.email ?? "User"}
            currentRoles={(userToEdit.roles ?? []) as Role[]}
            canAssignAdmin={canAssign}
            canAssignTeacher={canAssignTeacher}
          />
        </div>
      )}

      <div className="mt-6">
        <UserManagementTable profiles={profiles} initialRoleFilter={initialRole} />
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/users?page=${page - 1}${roleParam ? `&role=${roleParam}` : ""}${editUserId ? `&edit=${editUserId}` : ""}`}
              className="rounded-lg border border-green-soft px-4 py-2 text-sm font-medium text-deep-green hover:bg-light-green/50"
            >
              ← Previous
            </Link>
          )}
          <span className="text-sm text-foreground/70">
            Page {page} of {totalPages} ({totalCount} users)
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/users?page=${page + 1}${roleParam ? `&role=${roleParam}` : ""}${editUserId ? `&edit=${editUserId}` : ""}`}
              className="rounded-lg border border-green-soft px-4 py-2 text-sm font-medium text-deep-green hover:bg-light-green/50"
            >
              Next →
            </Link>
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
