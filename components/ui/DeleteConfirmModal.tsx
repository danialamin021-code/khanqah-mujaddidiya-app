"use client";

import { useState } from "react";

const CONFIRM_TEXT = "DELETE";

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  disabled?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  disabled = false,
}: DeleteConfirmModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [pending, setPending] = useState(false);

  const canConfirm = inputValue === CONFIRM_TEXT && !pending && !disabled;

  async function handleConfirm() {
    if (!canConfirm) return;
    setPending(true);
    try {
      await onConfirm();
      setInputValue("");
      onClose();
    } finally {
      setPending(false);
    }
  }

  function handleClose() {
    setInputValue("");
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-green-soft bg-[var(--background)] p-6 shadow-lg">
        <h3 className="font-heading text-lg font-normal text-deep-green">{title}</h3>
        <p className="mt-2 text-sm text-foreground/80">{description}</p>
        <p className="mt-3 text-sm font-medium text-foreground/90">
          Type <span className="font-mono font-bold text-red-600">{CONFIRM_TEXT}</span> to proceed:
        </p>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.toUpperCase())}
          placeholder={CONFIRM_TEXT}
          className="mt-2 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 font-mono text-sm uppercase"
          autoComplete="off"
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-green-soft px-4 py-2 text-sm font-medium text-deep-green hover:bg-light-green/50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
