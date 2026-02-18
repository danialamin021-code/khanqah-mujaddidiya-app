-- Phase 12: Audit logs, soft delete, platform hardening.
-- Run after Phase-11.

-- =============================================================================
-- 1. SYSTEM_ACTIVITY_LOGS
-- =============================================================================
CREATE TABLE public.system_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role text,
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_system_activity_logs_actor_id ON public.system_activity_logs(actor_id);
CREATE INDEX idx_system_activity_logs_entity ON public.system_activity_logs(entity_type, entity_id);
CREATE INDEX idx_system_activity_logs_created_at ON public.system_activity_logs(created_at DESC);

ALTER TABLE public.system_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admin or director can read logs
CREATE POLICY "Admins can read system_activity_logs"
  ON public.system_activity_logs FOR SELECT
  USING (public.is_admin_or_director());

-- Service role / authenticated insert (from server actions as admin)
-- Allow insert for authenticated users (server will validate admin before logging)
CREATE POLICY "Authenticated can insert system_activity_logs"
  ON public.system_activity_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================================================
-- 2. SOFT DELETE — is_archived columns
-- =============================================================================
ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

ALTER TABLE public.module_sessions
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

ALTER TABLE public.module_enrollments
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

-- Index for filtering non-archived
CREATE INDEX IF NOT EXISTS idx_modules_is_archived ON public.modules(is_archived) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_module_sessions_is_archived ON public.module_sessions(is_archived) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_module_enrollments_is_archived ON public.module_enrollments(is_archived) WHERE is_archived = false;
