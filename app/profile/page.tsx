import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPathBySlug } from "@/lib/data/paths";
import { getUserRoles, getAssignedModuleSlugs } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function ProfilePage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <main className="min-h-full px-6 py-8 md:py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-heading text-2xl font-normal text-deep-green">Profile</h1>
          <p className="mt-2 text-sm text-foreground/60">
            Configure Supabase in .env.local to see your profile.
          </p>
        </div>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <main className="min-h-full px-6 py-8 md:py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-heading text-2xl font-normal text-deep-green">Profile</h1>
          <p className="mt-2 text-foreground/80">
            Log in to see your enrolled paths and progress.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-gold-hover"
          >
            Log in
          </Link>
        </div>
      </main>
    );
  }

  const [enrollmentsData, roles, assignedModuleSlugs] = await Promise.all([
    supabase.from("enrollments").select("path_id").eq("user_id", user.id),
    getUserRoles(),
    getAssignedModuleSlugs(),
  ]);
  const pathSlugs = enrollmentsData?.data?.map((e) => e.path_id) ?? [];

  const { data: completions } = await supabase
    .from("session_completions")
    .select("path_id, session_id")
    .eq("user_id", user.id);
  const completedByPath = new Map<string, number>();
  completions?.forEach((c) => {
    completedByPath.set(c.path_id, (completedByPath.get(c.path_id) ?? 0) + 1);
  });

  const pathDetails = await Promise.all(pathSlugs.map((slug) => getPathBySlug(slug)));
  const pathBySlug = new Map(pathSlugs.map((slug, i) => [slug, pathDetails[i]]));

  return (
    <main className="min-h-full px-6 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-2xl font-normal text-deep-green">Profile</h1>
        <p className="mt-2 text-foreground/80">
          Your account and progress. No streaks or rewards—just simple tracking.
        </p>

        <section className="mt-10 rounded-2xl border border-green-soft bg-light-green/50 p-6 shadow-sm animate-slide-up">
          <h2 className="font-heading text-sm font-normal text-deep-green">Account</h2>
          <p className="mt-2 text-foreground/90">{user.email ?? "—"}</p>
        </section>

        <section className="mt-6 rounded-2xl border border-green-soft bg-light-green/50 p-6 shadow-sm animate-slide-up">
          <h2 className="font-heading text-sm font-normal text-deep-green">Roles</h2>
          <p className="mt-2 text-sm text-foreground/90">
            {roles.join(", ")}
          </p>
          {assignedModuleSlugs.length > 0 && (
            <p className="mt-2 text-sm text-foreground/70">
              Assigned modules: {assignedModuleSlugs.join(", ")}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/settings"
              className="text-sm font-medium text-deep-green hover:underline"
            >
              Settings →
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-deep-green hover:underline"
            >
              My Progress →
            </Link>
            {(roles.includes("teacher") || roles.includes("admin") || roles.includes("director")) && (
              <Link
                href="/teacher"
                className="text-sm font-medium text-deep-green hover:underline"
              >
                Teacher Panel →
              </Link>
            )}
            {(roles.includes("admin") || roles.includes("director")) && (
              <Link
                href="/admin"
                className="text-sm font-medium text-deep-green hover:underline"
              >
                Admin →
              </Link>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-green-soft bg-light-green/50 p-6 shadow-sm animate-slide-up">
          <h2 className="font-heading text-sm font-normal text-deep-green">Enrolled paths</h2>
          {pathSlugs.length === 0 ? (
            <p className="mt-2 text-sm text-foreground/60">
              You haven’t enrolled in any paths yet. Go to Paths and enroll to see them here.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pathSlugs.map((pathSlug) => {
                const path = pathBySlug.get(pathSlug);
                const totalSessions = path?.levels?.reduce((n, l) => n + l.sessions.length, 0) ?? 0;
                const completed = completedByPath.get(pathSlug) ?? 0;
                return (
                  <li key={pathSlug}>
                    <Link
                      href={`/paths/${pathSlug}`}
                      className="block rounded-xl border border-green-soft/80 bg-[var(--background)] px-4 py-3 transition-colors duration-200 hover:bg-light-green/40"
                    >
                      <span className="font-medium text-deep-green">
                        {path?.title ?? pathSlug}
                      </span>
                      <span className="ml-2 text-sm text-foreground/60">
                        — {completed}/{totalSessions} sessions complete
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="mt-10">
          <LogoutButton />
          <p className="mt-2 text-xs text-foreground/60">
            Sign out and return to the guest home experience.
          </p>
        </div>
      </div>
    </main>
  );
}
