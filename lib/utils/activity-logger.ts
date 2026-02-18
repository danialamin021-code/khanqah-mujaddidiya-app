/**
 * Activity logger — inserts records into system_activity_logs.
 * Call after successful critical actions.
 */

import { createClient } from "@/lib/supabase/server";

export interface LogActivityParams {
  actorId: string;
  actorRole: string;
  actionType: string;
  entityType: string;
  entityId?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  const supabase = await createClient();
  if (!supabase) return;

  await supabase.from("system_activity_logs").insert({
    actor_id: params.actorId,
    actor_role: params.actorRole,
    action_type: params.actionType,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    description: params.description ?? null,
    metadata: params.metadata ?? {},
  });
}
