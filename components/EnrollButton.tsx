"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { enrollInPath } from "@/app/actions/enrollment";

/**
 * Enroll button for path detail. Calls server action and refreshes.
 * Local test: click Enroll → path shows "Enrolled" / "Continue"; reload retains state.
 */
export default function EnrollButton({
  pathId,
  isEnrolled,
}: {
  pathId: string;
  isEnrolled: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEnroll() {
    setError(null);
    setLoading(true);
    const { error: err } = await enrollInPath(pathId);
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }
    router.refresh();
    setLoading(false);
  }

  if (isEnrolled) {
    return (
      <div className="mt-10">
        <span className="inline-block rounded-lg border border-green-soft bg-light-green/50 px-5 py-2.5 text-sm font-medium text-deep-green/80">
          Enrolled — continue above
        </span>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <button
        type="button"
        onClick={handleEnroll}
        disabled={loading}
        className="rounded-lg bg-muted-gold px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-gold-hover disabled:opacity-50"
      >
        {loading ? "Enrolling…" : "Enroll in this path"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
