"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markBatchAttendance } from "@/lib/actions/batch-attendance";
import type { BatchSessionRow } from "@/lib/data/batches";

export default function BatchAttendanceMarking({
  batchId,
  sessions,
  enrollments,
}: {
  batchId: string;
  sessions: BatchSessionRow[];
  enrollments: { user_id: string; full_name: string | null }[];
}) {
  const [sessionId, setSessionId] = useState<string>("");
  const [marking, setMarking] = useState<Record<string, "present" | "absent" | "late">>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSave() {
    if (!sessionId) return;
    setLoading(true);
    try {
      for (const [userId, status] of Object.entries(marking)) {
        await markBatchAttendance(sessionId, userId, status);
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (sessions.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-green-soft bg-light-green/30 p-4">
        <p className="text-sm text-foreground/70">No sessions yet. Add sessions to mark attendance.</p>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-green-soft bg-light-green/30 p-4">
        <p className="text-sm text-foreground/70">No students enrolled. Enroll students first.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-green-soft bg-light-green/30 p-6">
      <div>
        <label className="block text-sm font-medium text-deep-green/90">Select Session</label>
        <select
          value={sessionId}
          onChange={(e) => {
            setSessionId(e.target.value);
            setMarking({});
          }}
          className="mt-1 w-full max-w-md rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground"
        >
          <option value="">— Select session —</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {new Date(s.session_date).toLocaleDateString()} — {s.title}
            </option>
          ))}
        </select>
      </div>

      {sessionId && (
        <>
          <div className="space-y-2">
            <p className="text-sm font-medium text-deep-green/90">Mark attendance</p>
            {enrollments.map((e) => (
              <div key={e.user_id} className="flex items-center gap-4">
                <span className="w-40 truncate text-sm text-foreground/90">
                  {e.full_name ?? "—"}
                </span>
                <select
                  value={marking[e.user_id] ?? "absent"}
                  onChange={(ev) =>
                    setMarking((prev) => ({ ...prev, [e.user_id]: ev.target.value as "present" | "absent" | "late" }))
                  }
                  className="rounded border border-green-soft bg-[var(--background)] px-2 py-1 text-sm"
                >
                  <option value="absent">Absent</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                </select>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white hover:bg-gold-hover disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save Attendance"}
          </button>
        </>
      )}
    </div>
  );
}
