-- Phase 1 & 2: Hybrid Module + Batch, Status Engine, Completion Engine
-- Run after 20250218000000_academic_batch_system.sql
-- Preserves all existing RBAC, RLS, and production hardening.

-- =============================================================================
-- 1. TRIGGER: Auto-create default batch when module is created
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_default_batch_for_module()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.batches (module_id, name, is_active)
  VALUES (NEW.id, NEW.title || ' — Default Batch', true);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_module_created_create_default_batch ON public.modules;
CREATE TRIGGER on_module_created_create_default_batch
  AFTER INSERT ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.create_default_batch_for_module();

-- Backfill: Create default batch for existing modules that have none
INSERT INTO public.batches (module_id, name, is_active)
SELECT m.id, m.title || ' — Default Batch', true
FROM public.modules m
WHERE NOT EXISTS (SELECT 1 FROM public.batches b WHERE b.module_id = m.id)
;

-- =============================================================================
-- 2. BATCH_ENROLLMENTS: Add completion_status
-- =============================================================================
ALTER TABLE public.batch_enrollments
  ADD COLUMN IF NOT EXISTS completion_status text DEFAULT 'in_progress'
  CHECK (completion_status IN ('in_progress', 'completed', 'failed'));

-- Keep enrollment_status for active/inactive; completion_status for outcome
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_completion_status
  ON public.batch_enrollments(completion_status);

-- =============================================================================
-- 3. VIEW: batch_with_status (computed status)
-- =============================================================================
CREATE OR REPLACE VIEW public.batch_with_status AS
SELECT
  b.id,
  b.module_id,
  b.name,
  b.description,
  b.start_date,
  b.end_date,
  b.teacher_id,
  b.whatsapp_group_link,
  b.price,
  b.currency,
  b.is_paid,
  b.is_active,
  b.created_at,
  CASE
    WHEN b.is_active = false THEN 'archived'::text
    WHEN b.start_date IS NOT NULL AND CURRENT_DATE < b.start_date THEN 'upcoming'::text
    WHEN b.end_date IS NOT NULL AND CURRENT_DATE > b.end_date THEN 'completed'::text
    ELSE 'active'::text
  END AS computed_status
FROM public.batches b;

-- View runs with invoker's permissions so RLS on batches applies
ALTER VIEW public.batch_with_status SET (security_invoker = true);

-- =============================================================================
-- 4. COMPLETION ENGINE: Update recalculate_batch_participation
-- =============================================================================
CREATE OR REPLACE FUNCTION public.recalculate_batch_participation(
  p_batch_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_total_sessions int;
  v_present_count int;
  v_pct numeric;
  v_batch_end date;
  v_batch_active boolean;
  v_new_completion text;
BEGIN
  SELECT COUNT(*)::int INTO v_total_sessions
  FROM public.batch_sessions
  WHERE batch_id = p_batch_id;

  SELECT COUNT(*)::int INTO v_present_count
  FROM public.batch_attendance ba
  JOIN public.batch_sessions bs ON bs.id = ba.batch_session_id
  WHERE bs.batch_id = p_batch_id
  AND ba.user_id = p_user_id
  AND ba.status = 'present';

  v_pct := CASE WHEN v_total_sessions > 0
    THEN ROUND((v_present_count::numeric / v_total_sessions::numeric) * 100, 2)
    ELSE 0
  END;

  INSERT INTO public.batch_participation (
    batch_id, user_id, total_sessions, sessions_attended,
    attendance_percentage, engagement_score, updated_at
  )
  VALUES (
    p_batch_id, p_user_id, v_total_sessions, v_present_count,
    v_pct, v_pct, now()
  )
  ON CONFLICT (batch_id, user_id) DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    sessions_attended = EXCLUDED.sessions_attended,
    attendance_percentage = EXCLUDED.attendance_percentage,
    engagement_score = EXCLUDED.engagement_score,
    updated_at = now(),
    last_attended_at = CASE WHEN v_present_count > 0 THEN (
      SELECT MAX(ba.created_at) FROM public.batch_attendance ba
      JOIN public.batch_sessions bs ON bs.id = ba.batch_session_id
      WHERE bs.batch_id = p_batch_id AND ba.user_id = p_user_id AND ba.status = 'present'
    ) ELSE batch_participation.last_attended_at END;

  -- Completion engine: if batch is completed (end_date < today or is_active=false), set completion_status
  SELECT b.end_date, b.is_active INTO v_batch_end, v_batch_active
  FROM public.batches b WHERE b.id = p_batch_id;

  IF v_batch_active = false OR (v_batch_end IS NOT NULL AND v_batch_end < CURRENT_DATE) THEN
    IF v_pct >= 70 THEN
      v_new_completion := 'completed';
    ELSE
      v_new_completion := 'failed';
    END IF;
    UPDATE public.batch_enrollments
    SET completion_status = v_new_completion
    WHERE batch_id = p_batch_id AND user_id = p_user_id AND enrollment_status = 'active';
  END IF;
END;
$$;
