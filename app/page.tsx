import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Root: logged-in users → /paths; guests → Onboarding (auth step).
 * Onboarding Enter/Skip then leads to Home.
 */
export default async function RootPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/onboarding");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/paths");
  redirect("/onboarding");
}
