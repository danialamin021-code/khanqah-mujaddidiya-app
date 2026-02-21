"use client";

import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/hooks/use-user";
import { useActiveRole } from "@/components/ActiveRoleProvider";
import { useState } from "react";
import { Menu, type LucideIcon } from "lucide-react";
import HamburgerMenu from "./HamburgerMenu";
import RoleSwitcher from "./RoleSwitcher";
import NotificationBell from "./NotificationBell";
import { getBottomNavForActiveRole } from "@/lib/constants/nav";

import { NAV_LOGO } from "@/lib/constants/sheikh";

function BottomNavLink({
  href,
  label,
  Icon,
  isActive,
}: {
  href: string;
  label: string;
  Icon: LucideIcon;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 min-h-[52px] text-xs font-medium transition-colors duration-200 ${
        isActive ? "text-white" : "text-white/85 hover:text-white"
      }`}
    >
      <Icon
        className={`h-6 w-6 shrink-0 transition-colors ${isActive ? "text-[var(--nav-icon)]" : "text-[var(--nav-icon)]/90 hover:text-[var(--nav-icon)]"}`}
        strokeWidth={2}
        aria-hidden
      />
      <span className="block">{label}</span>
    </Link>
  );
}

/** Inner nav — keyed by pathname so menu closes on route change (avoids setState in effect). */
function AppNavInner() {
  const pathname = usePathname();
  const { user, loading } = useUser();
  const { activeRole, setActiveRole, hasMultipleRoles, availableRoles } = useActiveRole();
  const [menuOpen, setMenuOpen] = useState(false);

  const profileHref = loading ? "/profile" : user ? "/profile" : "/login";
  const profileLabel = loading ? "…" : user ? "Profile" : "Log in";
  const bottomNav = getBottomNavForActiveRole(activeRole, !!user);

  return (
    <>
      {/* Top bar: nav green background, white text/logo, gold icons */}
      <header className="fixed left-0 right-0 top-0 z-30 border-b border-[var(--nav-bg)]/80 bg-[var(--nav-bg)] backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded p-2 text-[var(--nav-icon)] transition-colors hover:bg-white/10"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" strokeWidth={2} aria-hidden />
            </button>
            <Link
              href="/home"
              className="flex items-center shrink-0 hover:opacity-90 transition-opacity"
              aria-label="Khanqah Mujaddidiyya — Home"
            >
              <SafeImage
                src={NAV_LOGO}
                alt="Khanqah Mujaddidiyya"
                width={180}
                height={44}
                className="h-9 w-auto max-w-[160px] object-contain sm:h-10 sm:max-w-[200px] md:max-w-[220px]"
                priority
                fallbackClassName="bg-white/20 min-h-[36px] min-w-[120px]"
              />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {hasMultipleRoles && user && (
              <RoleSwitcher
                activeRole={activeRole}
                availableRoles={availableRoles}
                onSwitch={setActiveRole}
              />
            )}
            {user && <NotificationBell />}
            <Link
              href="/bayat"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-[var(--muted-gold)] px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[var(--gold-hover)] sm:min-w-0 sm:px-4"
              aria-label="Perform Bayat"
            >
              <span className="hidden sm:inline">Perform Bayat</span>
              <span className="sm:hidden">Bayat</span>
            </Link>
          </div>
        </div>
      </header>

      <HamburgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} activeRole={activeRole} />

      {/* Bottom nav: role-aware, mobile-first */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--nav-bg)]/80 bg-[var(--nav-bg)] pb-[env(safe-area-inset-bottom,0px)] backdrop-blur"
        aria-label="Main navigation"
      >
        <div className="flex h-16 min-h-[64px] items-stretch">
          {bottomNav.map(({ href, label, Icon }) => (
            <BottomNavLink
              key={href}
              href={href === "/profile" ? profileHref : href}
              label={href === "/profile" ? profileLabel : label}
              Icon={Icon}
              isActive={
                (() => {
                  const h = href === "/profile" ? profileHref : href;
                  if (pathname === h) return true;
                  if (href === "/profile") return pathname.startsWith("/profile");
                  if (h === "/admin") return pathname === "/admin";
                  if (h === "/home") return pathname === "/home";
                  return pathname.startsWith(h + "/");
                })()
              }
            />
          ))}
        </div>
      </nav>
    </>
  );
}

export default function AppNav() {
  const pathname = usePathname();
  return <AppNavInner key={pathname} />;
}
