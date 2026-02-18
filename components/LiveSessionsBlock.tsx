"use client";

import { useRealtimeModule } from "@/lib/hooks/use-realtime-module";
import { useUser } from "@/lib/hooks/use-user";

/**
 * Live sessions block — uses real-time for session updates.
 * Only subscribes when moduleId and userId are provided.
 * Scope: one module. No cross-module data.
 */
export function LiveSessionsBlock({ moduleId }: { moduleId: string | null }) {
  const { user } = useUser();
  const { sessions } = useRealtimeModule(moduleId, user?.id ?? null);

  const liveSession = sessions.find((s) => s.status === "live");
  const nextSession = sessions
    .filter((s) => s.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  if (!moduleId) return null;

  return (
    <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
      <h2 className="font-heading text-sm font-normal text-deep-green">
        Live session
      </h2>
      {liveSession ? (
        <div className="mt-3">
          <p className="text-sm font-medium text-deep-green/90">Now live</p>
          <p className="mt-1 text-sm text-foreground/80">{liveSession.topic ?? "Session"}</p>
          {liveSession.zoom_link && (
            <a
              href={liveSession.zoom_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-gold-hover"
            >
              Join Session
            </a>
          )}
        </div>
      ) : nextSession ? (
        <div className="mt-3">
          <p className="text-sm text-foreground/80">
            Next: {nextSession.date} {nextSession.time ?? ""} — {nextSession.topic ?? "Session"}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-foreground/70">No sessions scheduled.</p>
      )}
    </div>
  );
}
