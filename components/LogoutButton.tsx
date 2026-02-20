"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { logoutAndClearTokens } from "@/app/actions/logout";

/**
 * Logout button. Clears push tokens, signs out, redirects to home.
 */
export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await logoutAndClearTokens();
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/home");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg border border-green-soft bg-[var(--background)] px-5 py-2.5 text-sm font-medium text-deep-green transition-colors duration-200 hover:bg-light-green/50 disabled:opacity-50"
    >
      {loading ? "Signing out…" : "Log out"}
    </button>
  );
}
