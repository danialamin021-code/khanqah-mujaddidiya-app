"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, X, Settings } from "lucide-react";
import { useUser } from "@/lib/hooks/use-user";
import { getMenuItemsForActiveRole } from "@/lib/constants/nav";
import type { ActiveRoleForNav } from "@/lib/constants/nav";

/**
 * Mobile: drawer opened by hamburger. Exclusive menu per active role.
 */
export default function HamburgerMenu({
  open,
  onClose,
  activeRole = "student",
}: {
  open: boolean;
  onClose: () => void;
  activeRole?: ActiveRoleForNav;
}) {
  const pathname = usePathname();
  const { user, loading } = useUser();
  const menuItems = getMenuItemsForActiveRole(activeRole);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed left-0 top-0 z-50 h-full w-72 max-w-[85vw] border-r border-light-green bg-[var(--background)] shadow-lg"
        aria-label="Menu"
      >
        <div className="flex h-14 items-center justify-between border-b border-light-green px-4">
          <span className="font-heading text-lg font-normal text-deep-green">
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-foreground/70 hover:bg-light-green/50 hover:text-deep-green"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
        </div>
        <div className="flex flex-col gap-1 p-3">
          {menuItems.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-light-green text-deep-green"
                  : "text-deep-green/80 hover:bg-green-soft/50"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
              {label}
            </Link>
          ))}
          {!loading && user && (
            <Link
              href="/settings"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-deep-green/80 hover:bg-green-soft/50"
            >
              <Settings className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
              Settings
            </Link>
          )}
          {!loading && (
            user ? (
              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-deep-green/80 hover:bg-green-soft/50"
              >
                <User className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
                Profile
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-deep-green/80 hover:bg-green-soft/50"
              >
                <User className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
                Log in
              </Link>
            )
          )}
        </div>
      </aside>
    </>
  );
}
