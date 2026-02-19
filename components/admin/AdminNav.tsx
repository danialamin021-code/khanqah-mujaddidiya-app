"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, LayoutDashboard, ArrowLeft } from "lucide-react";

const NAV_GROUPS = [
  {
    label: "People",
    items: [
      { href: "/admin/users?role=student", label: "Students" },
      { href: "/admin/users?role=teacher", label: "Teachers" },
      { href: "/admin/approvals", label: "Approvals" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/modules", label: "Modules" },
      { href: "/admin/paths", label: "Paths" },
      { href: "/admin/announcements", label: "Announcements" },
      { href: "/admin/news", label: "News" },
      { href: "/admin/events", label: "Events" },
      { href: "/admin/questions", label: "Questions" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/assignments", label: "Assignments" },
      { href: "/admin/reports", label: "Reports" },
      { href: "/admin/requests", label: "Requests" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/system-health", label: "System Health" },
      { href: "/admin/activity-logs", label: "Activity Logs" },
    ],
  },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  if (href.includes("?")) {
    const base = href.split("?")[0];
    return pathname.startsWith(base);
  }
  return pathname === href || pathname.startsWith(href + "/");
}

function isGroupActive(pathname: string, items: readonly { href: string }[]): boolean {
  return items.some((item) => isActive(pathname, item.href));
}

export default function AdminNav() {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (Object.values(refs.current).some((r) => r?.contains(e.target as Node))) return;
      setOpenGroup(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm">
      <Link
        href="/admin"
        className={`rounded-lg px-3 py-2 font-medium transition-colors ${
          pathname === "/admin" ? "bg-light-green/60 text-deep-green" : "text-deep-green/80 hover:bg-light-green/40 hover:text-deep-green"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <LayoutDashboard className="h-4 w-4" strokeWidth={2} />
          Dashboard
        </span>
      </Link>

      {NAV_GROUPS.map((group) => {
        const active = isGroupActive(pathname, group.items);
        const isOpen = openGroup === group.label;
        return (
          <div key={group.label} className="relative" ref={(el) => { refs.current[group.label] = el; }}>
            <button
              type="button"
              onClick={() => setOpenGroup((g) => (g === group.label ? null : group.label))}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 font-medium transition-colors ${
                active ? "bg-light-green/60 text-deep-green" : "text-deep-green/80 hover:bg-light-green/40 hover:text-deep-green"
              }`}
              aria-expanded={isOpen}
              aria-haspopup="true"
            >
              {group.label}
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} strokeWidth={2} />
            </button>
            {isOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-green-soft bg-[var(--background)] py-1 shadow-lg">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpenGroup(null)}
                    className={`block px-4 py-2 text-left transition-colors hover:bg-light-green/50 ${
                      isActive(pathname, item.href) ? "bg-light-green/50 font-medium text-deep-green" : "text-foreground/90"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <Link
        href="/home"
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-deep-green/70 transition-colors hover:bg-light-green/40 hover:text-deep-green"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        App
      </Link>
    </nav>
  );
}
