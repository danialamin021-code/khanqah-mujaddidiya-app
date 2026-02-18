"use client";

import { useState, useRef, useEffect } from "react";
import type { ActiveRole } from "@/lib/hooks/use-active-role";
import { ChevronDown } from "lucide-react";

const ROLE_LABELS: Record<ActiveRole, string> = {
  student: "Student",
  teacher: "Teacher",
  admin: "Admin",
};

export default function RoleSwitcher({
  activeRole,
  availableRoles,
  onSwitch,
  disabled,
}: {
  activeRole: ActiveRole;
  availableRoles: ActiveRole[];
  onSwitch: (role: ActiveRole) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (disabled || availableRoles.length < 2) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Switch role"
      >
        <span>View as {ROLE_LABELS[activeRole]}</span>
        <ChevronDown className="h-4 w-4 opacity-80" strokeWidth={2} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border border-green-soft bg-[var(--background)] py-1 shadow-lg"
        >
          {availableRoles.map((role) => (
            <li key={role}>
              <button
                type="button"
                role="option"
                aria-selected={activeRole === role}
                onClick={() => {
                  onSwitch(role);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-light-green/50 ${
                  activeRole === role ? "bg-light-green/50 font-medium text-deep-green" : "text-foreground/90"
                }`}
              >
                View as {ROLE_LABELS[role]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
