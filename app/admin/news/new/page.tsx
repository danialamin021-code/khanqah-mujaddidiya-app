import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import NewsForm from "../NewsForm";

export default async function AdminNewsNewPage() {
  const canAccess = await requireAdmin();
  if (!canAccess) redirect("/home");

  return (
    <div>
      <h1 className="font-heading text-2xl font-normal text-deep-green">
        New news article
      </h1>
      <p className="mt-2 text-sm text-foreground/70">
        This will appear in News & Updates on Home.
      </p>
      <NewsForm />
    </div>
  );
}
