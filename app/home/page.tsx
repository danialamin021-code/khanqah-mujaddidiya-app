import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAssignedModulesForUser } from "@/lib/data/modules";
import HomePageContent from "@/components/home/HomePageContent";
import ReportsOverview from "@/components/home/ReportsOverview";

/**
 * Primary dashboard. Role-specific layout: Student, Teacher, or Admin.
 * Redirects users with pending role_request to /pending-approval.
 */
export default async function HomePage() {
  const supabase = await createClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("roles, role_request")
        .eq("id", user.id)
        .single();
      const roleRequest = (profile as { role_request?: string | null })?.role_request;
      const roles = (profile as { roles?: string[] })?.roles ?? [];
      if (roleRequest && !roles.includes("teacher") && !roles.includes("admin") && !roles.includes("director")) {
        redirect("/pending-approval");
      }
    }
  }

  let assignedModules: { slug: string; title: string }[] = [];
  let teacherName: string | undefined;
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      try {
        const mods = await getAssignedModulesForUser(user.id);
        assignedModules = (mods ?? []).map((m) => ({ slug: m.slug, title: m.title }));
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .single();
        teacherName = (profile as { full_name?: string | null })?.full_name
          ?? (profile as { email?: string | null })?.email
          ?? undefined;
      } catch {
        assignedModules = [];
      }
    }
  }

  const activeRole = await import("@/lib/auth").then((m) => m.getActiveRoleForServer());
  if (activeRole === "admin") redirect("/admin");

  return (
    <HomePageContent
      assignedModules={assignedModules}
      teacherName={teacherName}
      reportsSection={<ReportsOverview />}
    />
  );
}
