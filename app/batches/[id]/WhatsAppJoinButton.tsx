"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markJoinedWhatsApp } from "@/lib/actions/batch-enrollment";

export default function WhatsAppJoinButton({
  batchId,
  joined,
}: {
  batchId: string;
  joined: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(joined);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    try {
      const result = await markJoinedWhatsApp(batchId);
      if (result.success) {
        setDone(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="mt-3 text-sm text-green-600 dark:text-green-400">✓ You have joined the WhatsApp group</p>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="mt-3 rounded-lg border border-green-soft px-4 py-2 text-sm font-medium text-deep-green hover:bg-light-green/50 disabled:opacity-60"
    >
      {loading ? "Saving…" : "I have joined the WhatsApp group"}
    </button>
  );
}
