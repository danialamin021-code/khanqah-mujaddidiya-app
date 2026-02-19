"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { markAttendance } from "@/lib/actions/module-attendance";
import { useTransition } from "react";

interface SessionRow {
  id: string;
  date: string;
  time: string | null;
  topic: string | null;
  status: string;
}

interface StudentRow {
  id: string;
  full_name?: string | null;
  email?: string | null;
}

interface AttendanceRow {
  id: string;
  session_id: string;
  user_id: string;
  status: string;
}

export default function AttendanceList({
  moduleId: _moduleId,
  sessions,
  students,
  attendance,
}: {
  moduleId: string;
  sessions: SessionRow[];
  students: StudentRow[];
  attendance: AttendanceRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const attMap = new Map<string, string>();
  attendance.forEach((a) => {
    attMap.set(`${a.session_id}:${a.user_id}`, a.status);
  });

  function handleToggle(sessionId: string, userId: string, current: string) {
    const next = current === "present" ? "absent" : "present";
    startTransition(async () => {
      const res = await markAttendance(sessionId, userId, next as "present" | "absent");
      if (res?.error) toast.error(res.error);
      else router.refresh();
    });
  }

  if (sessions.length === 0) {
    return (
      <p className="mt-4 text-sm text-foreground/70">
        No sessions yet. Create sessions in the Sessions tab first.
      </p>
    );
  }

  if (students.length === 0) {
    return (
      <p className="mt-4 text-sm text-foreground/70">
        No students found. Student profiles will appear when users enroll.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="rounded-xl border border-green-soft bg-[var(--background)] p-4"
        >
          <h3 className="font-medium text-deep-green/90">
            {session.date} {session.time ? `· ${session.time}` : ""} — {session.topic ?? "Session"}
          </h3>
          <ul className="mt-3 space-y-2">
            {students.map((student) => {
              const key = `${session.id}:${student.id}`;
              const status = attMap.get(key) ?? "absent";
              return (
                <li
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-green-soft/60 bg-light-green/30 px-3 py-2"
                >
                  <span className="text-sm text-foreground/90">
                    {student.full_name ?? student.email ?? "Unknown"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggle(session.id, student.id, status)}
                    disabled={pending}
                    className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                      status === "present"
                        ? "bg-green-600/20 text-green-700 dark:text-green-400"
                        : "bg-foreground/10 text-foreground/70 hover:bg-foreground/20"
                    }`}
                  >
                    {status === "present" ? "Present" : "Absent"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
