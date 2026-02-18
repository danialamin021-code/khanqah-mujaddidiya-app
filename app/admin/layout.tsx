import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";

/**
 * Admin area. Admins and directors can access.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const canAccess = await requireAdmin();
  if (!canAccess) redirect("/home");

  return (
    <div className="min-h-full">
      <header className="border-b border-green-soft bg-light-green/30 px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin"
            className="font-heading text-lg font-normal text-deep-green hover:opacity-90"
          >
            Admin
          </Link>
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">{children}</main>
    </div>
  );
}
