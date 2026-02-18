"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Logout button. Signs out and redirects to home.
 * Local test: click Log out → redirect to /home; nav shows "Log in".
 */
export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
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
