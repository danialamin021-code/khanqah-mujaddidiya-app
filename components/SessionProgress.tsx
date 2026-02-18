"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { markSessionComplete, updateLastVisited } from "@/app/actions/progress";

/**
 * Updates last-visited on mount and provides "Mark complete" button.
 * Local test: open session → last visited updated; mark complete → checkmark on path detail after reload.
 */
export default function SessionProgress({
  pathId,
  sessionId,
  isCompleted,
}: {
  pathId: string;
  sessionId: string;
  isCompleted: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    updateLastVisited(pathId, sessionId);
  }, [pathId, sessionId]);

  async function handleMarkComplete() {
    await markSessionComplete(pathId, sessionId);
    router.refresh();
  }

  if (isCompleted) {
    return (
      <p className="mt-6 text-sm font-medium text-deep-green/80">
        ✓ Completed
      </p>
    );
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={handleMarkComplete}
        className="rounded-lg bg-muted-gold px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-gold-hover"
      >
        Mark as complete
      </button>
    </div>
  );
}
