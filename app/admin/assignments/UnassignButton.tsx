"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { unassignTeacher } from "@/lib/actions/module-teachers";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

export default function UnassignButton({
  moduleId,
  userId,
  teacherName,
}: {
  moduleId: string;
  userId: string;
  teacherName?: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  async function handleConfirm() {
    const res = await unassignTeacher(moduleId, userId);
    if (res?.error) {
      toast.error(res.error);
      throw new Error(res.error);
    }
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
      >
        Remove
      </button>
      <DeleteConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        title="Unassign Teacher"
        description={`Remove ${teacherName ?? "this teacher"} from the module?`}
        confirmLabel="Remove"
      />
    </>
  );
}
