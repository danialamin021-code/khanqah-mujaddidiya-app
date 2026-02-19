import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Routes that do not require authentication (auth gateway). */
const PUBLIC_PATHS = [
  "/",
  "/onboarding",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/pending-approval",
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/auth/")) return true;
  return false;
}

/** Teacher panel: /teacher and /teacher/* — requires teacher, admin, or director. */
function isTeacherPath(pathname: string): boolean {
  return pathname === "/teacher" || pathname.startsWith("/teacher/");
}

/** Admin panel: /admin and /admin/* — requires admin or director. */
function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/**
 * Refreshes Supabase auth session and updates cookies.
 * Auth gateway: unauthenticated users on protected routes are redirected to /login.
 * RBAC: Students cannot access /teacher or /admin; Teachers cannot access /admin.
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // RBAC: Block unauthorized access to /teacher and /admin
  if (user && !isPublicPath(pathname)) {
    if (isAdminPath(pathname)) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("roles")
        .eq("id", user.id)
        .single();
      const roles = (profile?.roles ?? []) as string[];
      const canAccessAdmin = roles.includes("admin") || roles.includes("director");
      if (!canAccessAdmin) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } else if (isTeacherPath(pathname)) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("roles")
        .eq("id", user.id)
        .single();
      const roles = (profile?.roles ?? []) as string[];
      const canAccessTeacher =
        roles.includes("teacher") || roles.includes("admin") || roles.includes("director");
      if (!canAccessTeacher) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  return supabaseResponse;
}
