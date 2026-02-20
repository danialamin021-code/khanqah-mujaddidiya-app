"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BatchEnrollModal from "@/components/BatchEnrollModal";

export default function BatchEnrollButton({
  batchName,
  batchId,
  whatsappGroupLink,
}: {
  batchName: string;
  batchId: string;
  whatsappGroupLink: string | null;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg bg-muted-gold py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-gold-hover sm:w-auto sm:px-8"
      >
        Enroll in {batchName}
      </button>
      {open && (
        <BatchEnrollModal
          batchName={batchName}
          batchId={batchId}
          whatsappGroupLink={whatsappGroupLink}
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
