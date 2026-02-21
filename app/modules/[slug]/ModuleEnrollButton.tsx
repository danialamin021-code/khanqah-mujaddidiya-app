"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EnrollModal from "@/components/EnrollModal";

export default function ModuleEnrollButton({
  moduleName,
  batches,
  isEnrolled,
}: {
  moduleName: string;
  batches: { id: string; name: string; whatsapp_group_link?: string | null }[];
  isEnrolled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (isEnrolled) {
    return (
      <div className="rounded-lg border border-green-soft bg-light-green/30 px-6 py-3 text-center">
        <p className="text-sm font-medium text-deep-green/90">You are enrolled in {moduleName}</p>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg bg-muted-gold py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-gold-hover sm:w-auto sm:px-8"
      >
        Enroll in {moduleName}
      </button>
      {open && (
        <EnrollModal
          moduleName={moduleName}
          batches={batches}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
