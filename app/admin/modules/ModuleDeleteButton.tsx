"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteModule } from "@/lib/actions/modules";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

export default function ModuleDeleteButton({
  moduleId,
  moduleTitle,
}: {
  moduleId: string;
  moduleTitle: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  async function handleConfirm() {
    const res = await deleteModule(moduleId);
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
        className="rounded-lg border border-red-500/50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-500/10"
      >
        Delete
      </button>
      <DeleteConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        title="Archive Module"
        description={`This will archive the module "${moduleTitle}". This action cannot be undone.`}
        confirmLabel="Archive"
      />
    </>
  );
}
