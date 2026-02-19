"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Role } from "@/lib/constants/permissions";

export interface ProfileRow {
  id: string;
  email?: string | null;
  full_name?: string | null;
  roles: string[];
  role_request?: string | null;
}

export default function UserManagementTable({
  profiles,
  initialRoleFilter = "all",
}: {
  profiles: ProfileRow[];
  initialRoleFilter?: Role | "all";
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">(initialRoleFilter);

  const filtered = useMemo(() => {
    let result = profiles;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          (p.email?.toLowerCase().includes(q)) ||
          (p.full_name?.toLowerCase().includes(q)) ||
          p.id.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== "all") {
      result = result.filter((p) => p.roles.includes(roleFilter));
    }
    return result;
  }, [profiles, search, roleFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <input
          type="search"
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm focus:border-deep-green/40 focus:outline-none focus:ring-1 focus:ring-deep-green/30"
          aria-label="Search users"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | "all")}
          className="min-h-[44px] min-w-0 rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-sm focus:border-deep-green/40 focus:outline-none sm:min-w-[140px]"
          aria-label="Filter by role"
        >
          <option value="all">All roles</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
          <option value="director">Director</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-green-soft -mx-2 px-2 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-green-soft bg-light-green/60">
              <th className="px-4 py-3 text-left font-medium text-deep-green">Email</th>
              <th className="px-4 py-3 text-left font-medium text-deep-green">Name</th>
              <th className="px-4 py-3 text-left font-medium text-deep-green">Roles</th>
              <th className="px-4 py-3 text-left font-medium text-deep-green">Status</th>
              <th className="px-4 py-3 text-left font-medium text-deep-green">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--background)]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/60">
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-green-soft/80 last:border-0 hover:bg-light-green/30"
                >
                  <td className="px-4 py-3 text-foreground/90">{p.email ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground/90">{p.full_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-light-green/60 px-2 py-0.5 text-xs">
                      {p.roles.join(", ") || "student"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.role_request ? (
                      <span className="text-amber-600">Pending {p.role_request.replace("pending_", "")}</span>
                    ) : (
                      <span className="text-foreground/60">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users?edit=${p.id}`}
                      className="font-medium text-deep-green hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-foreground/60">
        Showing {filtered.length} of {profiles.length} users
      </p>
    </div>
  );
}
