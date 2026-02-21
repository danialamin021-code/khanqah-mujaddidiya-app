/**
 * Role-based navigation config.
 * Bottom nav and hamburger items adapt to user role.
 */

import type { Role } from "./permissions";
import {
  Home,
  BookOpen,
  User,
  Mail,
  LayoutDashboard,
  Calendar,
  Users,
  ClipboardCheck,
  FileText,
  Megaphone,
  Settings,
  BarChart3,
  MessageCircle,
  Compass,
  FolderOpen,
  UserCog,
  BookMarked,
  Heart,
  Bell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
}

/** Student bottom nav ( always shown for guests; students see these ). */
export const BOTTOM_NAV_STUDENT: NavItem[] = [
  { href: "/home", label: "Home", Icon: Home },
  { href: "/modules", label: "Modules", Icon: BookOpen },
  { href: "/profile", label: "Profile", Icon: User },
  { href: "/contact", label: "Contact", Icon: Mail },
];

/** Extra bottom nav item when user is teacher — replaces Modules with Teacher Panel. */
export const BOTTOM_NAV_TEACHER: NavItem[] = [
  { href: "/home", label: "Home", Icon: Home },
  { href: "/teacher", label: "Teacher", Icon: LayoutDashboard },
  { href: "/profile", label: "Profile", Icon: User },
];

/** Admin bottom nav: Dashboard, Modules, Users, Reports, Profile */
export const BOTTOM_NAV_ADMIN: NavItem[] = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/modules", label: "Modules", Icon: BookOpen },
  { href: "/admin/users", label: "Users", Icon: UserCog },
  { href: "/admin/reports", label: "Reports", Icon: BarChart3 },
  { href: "/profile", label: "Profile", Icon: User },
];

/** Student hamburger items. */
export const MENU_STUDENT: NavItem[] = [
  { href: "/notifications", label: "Notifications", Icon: Bell },
  { href: "/modules", label: "Learning Modules", Icon: Compass },
  { href: "/dashboard", label: "My Progress", Icon: BarChart3 },
  { href: "/questions", label: "My questions", Icon: MessageCircle },
  { href: "/guidance", label: "Guidance", Icon: BookOpen },
  { href: "/sheikh", label: "Sheikh Introduction", Icon: User },
  { href: "/projects", label: "Our Projects", Icon: FolderOpen },
  { href: "/donate", label: "Support", Icon: Heart },
  { href: "/events", label: "Events", Icon: Calendar },
  { href: "/settings", label: "Settings", Icon: Settings },
];

/** Teacher hamburger items (exclusive when activeRole = teacher). */
export const MENU_TEACHER: NavItem[] = [
  { href: "/notifications", label: "Notifications", Icon: Bell },
  { href: "/teacher", label: "Teacher Dashboard", Icon: LayoutDashboard },
  { href: "/dashboard", label: "My Progress", Icon: BarChart3 },
  { href: "/teacher/sessions", label: "Sessions", Icon: Calendar },
  { href: "/teacher/students", label: "Students", Icon: Users },
  { href: "/teacher/attendance", label: "Attendance", Icon: ClipboardCheck },
  { href: "/teacher/resources", label: "Resources", Icon: FileText },
  { href: "/teacher/announcements", label: "Announcements", Icon: Megaphone },
  { href: "/settings", label: "Settings", Icon: Settings },
];

/** Admin hamburger items (exclusive when activeRole = admin). */
export const MENU_ADMIN: NavItem[] = [
  { href: "/notifications", label: "Notifications", Icon: Bell },
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", Icon: UserCog },
  { href: "/admin/modules", label: "Modules", Icon: BookMarked },
  { href: "/admin/assignments", label: "Teacher Assignment", Icon: Users },
  { href: "/admin/reports", label: "Reports", Icon: BarChart3 },
  { href: "/admin/paths", label: "Learning Paths", Icon: FolderOpen },
  { href: "/admin/announcements", label: "Announcements", Icon: Megaphone },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export function getBottomNavForRoles(roles: Role[], isLoggedIn: boolean): NavItem[] {
  if (!isLoggedIn) return BOTTOM_NAV_STUDENT;
  if (roles.includes("director") || roles.includes("admin"))
    return BOTTOM_NAV_ADMIN;
  if (roles.includes("teacher")) return BOTTOM_NAV_TEACHER;
  return BOTTOM_NAV_STUDENT;
}

export function getMenuItemsForRoles(roles: Role[]): NavItem[] {
  const byHref = new Map<string, NavItem>();
  MENU_STUDENT.forEach((i) => byHref.set(i.href, i));
  if (roles.some((r) => ["teacher", "admin", "director"].includes(r))) {
    MENU_TEACHER.forEach((i) => byHref.set(i.href, i));
  }
  if (roles.includes("admin") || roles.includes("director")) {
    MENU_ADMIN.forEach((i) => byHref.set(i.href, i));
  }
  return Array.from(byHref.values());
}

/** Active role for exclusive UI: student, teacher, or admin (director = admin). */
export type ActiveRoleForNav = "student" | "teacher" | "admin";

/** Exclusive bottom nav for a single active role. */
export function getBottomNavForActiveRole(activeRole: ActiveRoleForNav, isLoggedIn: boolean): NavItem[] {
  if (!isLoggedIn) return BOTTOM_NAV_STUDENT;
  if (activeRole === "admin") return BOTTOM_NAV_ADMIN;
  if (activeRole === "teacher") return BOTTOM_NAV_TEACHER;
  return BOTTOM_NAV_STUDENT;
}

/** Exclusive menu items for a single active role. */
export function getMenuItemsForActiveRole(activeRole: ActiveRoleForNav): NavItem[] {
  if (activeRole === "admin") return MENU_ADMIN;
  if (activeRole === "teacher") return MENU_TEACHER;
  return MENU_STUDENT;
}
