"use client";

import { usePathname } from "next/navigation";
import AppNav from "@/components/AppNav";
import { ActiveRoleProvider } from "@/components/ActiveRoleProvider";
import type { ActiveRole } from "@/components/ActiveRoleProvider";

const AUTH_PATHS = [
  "/",
  "/onboarding",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/pending-approval",
];

function isAuthPath(pathname: string): boolean {
  if (AUTH_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/auth/")) return true;
  return false;
}

/**
 * Hides AppNav and nav padding on auth routes (onboarding, login, signup, etc.).
 * Shows full app layout with nav only when authenticated and in the app.
 */
export default function AuthAwareLayout({
  children,
  initialRole,
}: {
  children: React.ReactNode;
  initialRole: ActiveRole;
}) {
  const pathname = usePathname();
  const isAuth = isAuthPath(pathname ?? "");

  if (isAuth) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <ActiveRoleProvider initialRole={initialRole}>
      <AppNav />
      <div className="min-h-screen pt-14 pb-[calc(4rem+env(safe-area-inset-bottom,0px))]">
        {children}
      </div>
    </ActiveRoleProvider>
  );
}
