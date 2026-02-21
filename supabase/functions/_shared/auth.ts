/**
 * Validate JWT and extract user. Used for role checks.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function getUserFromRequest(req: Request): Promise<{
  userId: string;
  email?: string;
} | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anonKey) return null;

  const supabase = createClient(url, anonKey);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return { userId: user.id, email: user.email };
}
