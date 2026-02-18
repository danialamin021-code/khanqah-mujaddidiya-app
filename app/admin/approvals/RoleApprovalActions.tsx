"use client";

import { useTransition } from "react";
import { approveRoleRequest, rejectRoleRequest } from "@/app/actions/role-approvals";
import { useRouter } from "next/navigation";

export default function RoleApprovalActions({
  userId,
  requestType,
}: {
  userId: string;
  requestType: "pending_teacher" | "pending_admin";
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const grantRole = requestType === "pending_teacher" ? "teacher" : "admin";

  function handleApprove() {
    startTransition(async () => {
      const result = await approveRoleRequest(userId, grantRole);
      if (result.success) router.refresh();
      else alert(result.error);
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await rejectRoleRequest(userId);
      if (result.success) router.refresh();
      else alert(result.error);
    });
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleApprove}
        disabled={isPending}
        className="rounded-lg bg-muted-gold px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gold-hover disabled:opacity-50"
      >
        Approve
      </button>
      <button
        type="button"
        onClick={handleReject}
        disabled={isPending}
        className="rounded-lg border border-green-soft bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-deep-green/90 transition-colors hover:bg-light-green/50 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
