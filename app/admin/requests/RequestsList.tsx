"use client";

import { useState } from "react";
import { updateBayatRequestStatus, updateGuidanceRequestStatus } from "@/app/actions/admin-requests";
import { toast } from "sonner";

type BayatRequest = {
  id: string;
  full_name: string;
  whatsapp: string;
  country: string | null;
  city: string | null;
  status: string;
  submitted_at: string;
};

type GuidanceRequest = {
  id: string;
  full_name: string;
  whatsapp: string;
  country: string | null;
  city: string | null;
  message: string | null;
  status: string;
  submitted_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under review" },
  { value: "responded", label: "Responded" },
] as const;

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
    under_review: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
    responded: "bg-green-600/20 text-green-700 dark:text-green-400",
  };
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-500/20"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function StatusSelect({
  currentStatus,
  requestId,
  type,
}: {
  currentStatus: string;
  requestId: string;
  type: "bayat" | "guidance";
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleChange(newStatus: string) {
    if (newStatus === status) return;
    setLoading(true);
    const action = type === "bayat" ? updateBayatRequestStatus : updateGuidanceRequestStatus;
    const result = await action(requestId, newStatus);
    setLoading(false);
    if (result.success) {
      setStatus(newStatus);
      toast.success("Status updated");
    } else {
      toast.error(result.error ?? "Failed to update");
    }
  }

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="rounded border border-green-soft bg-[var(--background)] px-2 py-1 text-xs font-medium text-deep-green/90 disabled:opacity-60"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export default function RequestsList({
  bayatRequests,
  guidanceRequests,
}: {
  bayatRequests: BayatRequest[];
  guidanceRequests: GuidanceRequest[];
}) {
  const [tab, setTab] = useState<"bayat" | "guidance">("bayat");

  return (
    <div className="mt-8">
      <div className="flex gap-2 border-b border-green-soft pb-2">
        <button
          type="button"
          onClick={() => setTab("bayat")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "bayat" ? "bg-light-green/60 text-deep-green" : "text-foreground/70 hover:bg-light-green/40"
          }`}
        >
          Bayat ({bayatRequests.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("guidance")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "guidance" ? "bg-light-green/60 text-deep-green" : "text-foreground/70 hover:bg-light-green/40"
          }`}
        >
          Guidance ({guidanceRequests.length})
        </button>
      </div>

      {tab === "bayat" && (
        <div className="mt-6">
          {bayatRequests.length === 0 ? (
            <ul className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
              <p className="text-foreground/80">No Bayat requests yet.</p>
            </ul>
          ) : (
            <ul className="space-y-3">
              {bayatRequests.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-green-soft bg-light-green/30 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-deep-green/90">{r.full_name}</p>
                      <p className="text-sm text-foreground/70">
                        {r.whatsapp} · {r.country ?? "—"} / {r.city ?? "—"}
                      </p>
                      <p className="mt-1 text-xs text-foreground/60">{formatDate(r.submitted_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.status} />
                      <StatusSelect
                        currentStatus={r.status}
                        requestId={r.id}
                        type="bayat"
                      />
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${r.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-deep-green hover:underline"
                  >
                    Contact via WhatsApp →
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "guidance" && (
        <div className="mt-6">
          {guidanceRequests.length === 0 ? (
            <ul className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
              <p className="text-foreground/80">No Guidance requests yet.</p>
            </ul>
          ) : (
            <ul className="space-y-3">
              {guidanceRequests.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-green-soft bg-light-green/30 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-deep-green/90">{r.full_name}</p>
                      <p className="text-sm text-foreground/70">
                        {r.whatsapp} · {r.country ?? "—"} / {r.city ?? "—"}
                      </p>
                      {r.message && (
                        <p className="mt-2 text-sm text-foreground/80 italic">&quot;{r.message}&quot;</p>
                      )}
                      <p className="mt-1 text-xs text-foreground/60">{formatDate(r.submitted_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.status} />
                      <StatusSelect
                        currentStatus={r.status}
                        requestId={r.id}
                        type="guidance"
                      />
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${r.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-deep-green hover:underline"
                  >
                    Contact via WhatsApp →
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
