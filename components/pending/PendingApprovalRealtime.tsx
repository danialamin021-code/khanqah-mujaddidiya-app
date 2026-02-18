"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to the user's profile via Supabase Realtime.
 * When role_request is cleared and user has teacher/admin/director role, redirects to /home.
 * Requires Realtime enabled for profiles table in Supabase.
 */
export default function PendingApprovalRealtime({ userId }: { userId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`profile:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const newRow = payload.new as { roles?: string[]; role_request?: string | null };
          const roles = newRow?.roles ?? [];
          const roleRequest = newRow?.role_request;
          if (!roleRequest && (roles.includes("teacher") || roles.includes("admin") || roles.includes("director"))) {
            router.replace("/home");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  return null;
}
