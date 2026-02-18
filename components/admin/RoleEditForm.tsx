"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateUserRoles } from "@/app/actions/user-roles";
import type { Role } from "@/lib/constants/permissions";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

const ROLES: Role[] = ["student", "teacher", "admin", "director"];

export interface RoleEditFormProps {
  userId: string;
  userName: string;
  currentRoles: Role[];
  canAssignAdmin: boolean;
  canAssignTeacher: boolean;
}

export default function RoleEditForm({
  userId,
  userName,
  currentRoles,
  canAssignAdmin,
  canAssignTeacher,
}: RoleEditFormProps) {
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(currentRoles);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  function toggleRole(role: Role) {
    if (role === "admin" || role === "director") {
      if (!canAssignAdmin) return;
    } else if (role === "teacher") {
      if (!canAssignTeacher) return;
    }
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  const hasChanges =
    selectedRoles.length !== currentRoles.length ||
    selectedRoles.some((r) => !currentRoles.includes(r)) ||
    currentRoles.some((r) => !selectedRoles.includes(r));

  async function handleConfirm() {
    const res = await updateUserRoles(userId, selectedRoles);
    if (res?.error) {
      toast.error(res.error);
      throw new Error(res.error);
    }
    router.push("/admin/users");
    router.refresh();
  }

  function handleCancel() {
    router.push("/admin/users");
    router.refresh();
  }

  return (
    <>
      <div className="rounded-2xl border border-green-soft bg-light-green/30 p-6">
        <h3 className="font-heading text-lg font-normal text-deep-green">
          Edit Roles — {userName}
        </h3>
        <p className="mt-1 text-sm text-foreground/70">
          Select roles for this user. Changes require confirmation.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {ROLES.map((role) => {
            const disabled =
              (role === "admin" || role === "director") && !canAssignAdmin
                ? true
                : role === "teacher" && !canAssignTeacher
                  ? true
                  : false;
            return (
              <label
                key={role}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 ${
                  selectedRoles.includes(role)
                    ? "border-muted-gold bg-muted-gold/20"
                    : "border-green-soft bg-[var(--background)]"
                } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role)}
                  onChange={() => toggleRole(role)}
                  disabled={disabled}
                  className="rounded"
                />
                <span className="text-sm font-medium capitalize">{role}</span>
              </label>
            );
          })}
        </div>
        {selectedRoles.length === 0 && (
          <p className="mt-2 text-sm text-amber-600">At least one role is required.</p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => hasChanges && setShowConfirm(true)}
            disabled={!hasChanges || selectedRoles.length === 0}
            className="rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white hover:bg-gold-hover disabled:opacity-50"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-green-soft px-4 py-2 text-sm font-medium text-deep-green hover:bg-light-green/50"
          >
            Cancel
          </button>
        </div>
      </div>
      <DeleteConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title="Confirm Role Change"
        description={`You are about to change roles for ${userName} to: ${selectedRoles.join(", ") || "none"}. This action will take effect immediately.`}
        confirmLabel="Apply Changes"
      />
    </>
  );
}
