"use client";

import { useState } from "react";

export interface ReportStat {
  label: string;
  value: string | number;
  sublabel?: string;
}

export default function ReportsTable({
  stats,
}: {
  stats: ReportStat[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-green-soft bg-light-green/50 p-6"
          >
            <p className="text-sm font-medium text-deep-green/90">{s.label}</p>
            <p className="mt-1 text-2xl font-heading text-deep-green">{s.value}</p>
            {s.sublabel && (
              <p className="mt-1 text-xs text-foreground/60">{s.sublabel}</p>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-green-soft bg-light-green/30 p-6">
        <h3 className="font-heading text-sm font-normal text-deep-green">
          Enrollment & Progress
        </h3>
        <p className="mt-2 text-sm text-foreground/70">
          Detailed enrollment, attendance, and session completion reports can be expanded here.
          Data is fetched from enrollments, session_completions, and module_attendance tables.
        </p>
      </div>
    </div>
  );
}
