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
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; edit?: string }>;
}) {
  const params = await searchParams;
  const roleParam = params.role as "student" | "teacher" | "admin" | "director" | undefined;
  const editUserId = params.edit;
  const initialRole = roleParam && ["student", "teacher", "admin", "director"].includes(roleParam)
    ? roleParam
    : "all";
  const roles = await getUserRoles();
  const canAssign = canAssignRoles(roles);
  const canAssignTeacher = roles.includes("admin") || roles.includes("director");

  const supabase = await createClient();
  let profiles: { id: string; email?: string | null; full_name?: string | null; roles: string[]; role_request?: string | null }[] = [];

  if (supabase) {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, roles, role_request");
      profiles = (data ?? []).map((p) => ({
        id: (p as { id: string }).id,
        email: (p as { email?: string | null }).email,
        full_name: (p as { full_name?: string | null }).full_name,
        roles: ((p as { roles?: string[] }).roles ?? []).filter(Boolean),
        role_request: (p as { role_request?: string | null }).role_request,
      }));
    } catch {
      profiles = [];
    }
  }

  const userToEdit = editUserId ? profiles.find((p) => p.id === editUserId) : null;

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
      <Link
        href="/admin"
        className="mt-6 inline-block text-sm font-medium text-deep-green hover:underline"
      >
        ← Admin
      </Link>
    </div>
  );
}
