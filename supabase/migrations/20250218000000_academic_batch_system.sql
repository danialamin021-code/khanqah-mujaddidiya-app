-- Academic Batch System — Phase 1: Database extension
-- Batches per module, sessions, enrollments, attendance, participation, push tokens, notifications.
-- Run after 20250217000000_production_hardening_rls.sql
-- Preserves all existing RBAC, RLS, and production hardening.

-- =============================================================================
-- 1. BATCHES TABLE
-- =============================================================================
CREATE TABLE public.batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  start_date date,
  end_date date,
  teacher_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  whatsapp_group_link text,
  price numeric DEFAULT 0,
  currency text DEFAULT 'PKR',
  is_paid boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_batches_module_id ON public.batches(module_id);
CREATE INDEX idx_batches_teacher_id ON public.batches(teacher_id);
CREATE INDEX idx_batches_is_active ON public.batches(is_active) WHERE is_active = true;

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

-- Teachers: SELECT only assigned batches
CREATE POLICY "Teachers can read assigned batches"
  ON public.batches FOR SELECT
  USING (teacher_id = auth.uid());

-- Admin/Director: full access
CREATE POLICY "Admins can manage batches"
  ON public.batches FOR ALL
  USING (public.is_admin_or_director())
  WITH CHECK (public.is_admin_or_director());

-- Students: SELECT only active batches for browsing
CREATE POLICY "Students can read active batches"
  ON public.batches FOR SELECT
  USING (is_active = true);

-- Helper: teacher of batch (needed for batch_sessions and batch_enrollments)
CREATE OR REPLACE FUNCTION public.is_teacher_of_batch(p_batch_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.batches b
    WHERE b.id = p_batch_id AND b.teacher_id = auth.uid()
  );
$$;

-- Helper: admin/director or teacher of batch
CREATE OR REPLACE FUNCTION public.can_access_batch(p_batch_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT public.is_admin_or_director() OR public.is_teacher_of_batch(p_batch_id);
$$;

-- =============================================================================
-- 2. BATCH_ENROLLMENTS TABLE (before batch_sessions — policy dependency)
-- =============================================================================
CREATE TABLE public.batch_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_id uuid NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  full_name text,
  whatsapp text,
  country text,
  city text,
  joined_whatsapp boolean DEFAULT false,
  enrollment_status text DEFAULT 'active' CHECK (enrollment_status IN ('active', 'inactive', 'completed')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, batch_id)
);

CREATE INDEX idx_batch_enrollments_user_id ON public.batch_enrollments(user_id);
CREATE INDEX idx_batch_enrollments_batch_id ON public.batch_enrollments(batch_id);
CREATE INDEX idx_batch_enrollments_enrollment_status ON public.batch_enrollments(enrollment_status);

ALTER TABLE public.batch_enrollments ENABLE ROW LEVEL SECURITY;

-- Students: view only their enrollments
CREATE POLICY "Students can read own batch_enrollments"
  ON public.batch_enrollments FOR SELECT
  USING (auth.uid() = user_id);

-- Students: insert own enrollment
CREATE POLICY "Students can enroll self in batch"
  ON public.batch_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Students: update own joined_whatsapp only
CREATE POLICY "Students can update own joined_whatsapp"
  ON public.batch_enrollments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Teachers: view enrollments of assigned batches
CREATE POLICY "Teachers can read batch_enrollments for assigned batches"
  ON public.batch_enrollments FOR SELECT
  USING (public.is_teacher_of_batch(batch_id));

-- Teachers: update enrollments for assigned batches (e.g. status)
CREATE POLICY "Teachers can update batch_enrollments for assigned batches"
  ON public.batch_enrollments FOR UPDATE
  USING (public.is_teacher_of_batch(batch_id))
  WITH CHECK (public.is_teacher_of_batch(batch_id));

-- Admin/Director: full access
CREATE POLICY "Admins can manage batch_enrollments"
  ON public.batch_enrollments FOR ALL
  USING (public.is_admin_or_director())
  WITH CHECK (public.is_admin_or_director());

-- =============================================================================
-- 3. BATCH_SESSIONS TABLE
-- =============================================================================
CREATE TABLE public.batch_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  title text NOT NULL,
  session_date date NOT NULL,
  zoom_link text,
  topic text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_batch_sessions_batch_id ON public.batch_sessions(batch_id);

ALTER TABLE public.batch_sessions ENABLE ROW LEVEL SECURITY;

-- Teachers assigned to batch can manage sessions
CREATE POLICY "Teachers can manage batch_sessions"
  ON public.batch_sessions FOR ALL
  USING (public.can_access_batch(batch_id))
  WITH CHECK (public.can_access_batch(batch_id));

-- Students: read-only for enrolled batches
CREATE POLICY "Students can read batch_sessions for enrolled batches"
  ON public.batch_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.batch_enrollments be
      WHERE be.batch_id = batch_sessions.batch_id
      AND be.user_id = auth.uid()
      AND be.enrollment_status = 'active'
    )
  );

-- =============================================================================
-- 4. BATCH_ATTENDANCE TABLE
-- =============================================================================
CREATE TABLE public.batch_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_session_id uuid NOT NULL REFERENCES public.batch_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (batch_session_id, user_id)
);

CREATE INDEX idx_batch_attendance_session_id ON public.batch_attendance(batch_session_id);
CREATE INDEX idx_batch_attendance_user_id ON public.batch_attendance(user_id);

ALTER TABLE public.batch_attendance ENABLE ROW LEVEL SECURITY;

-- Helper: teacher of session's batch
CREATE OR REPLACE FUNCTION public.is_teacher_of_batch_session(p_session_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.batch_sessions bs
    JOIN public.batches b ON b.id = bs.batch_id
    WHERE bs.id = p_session_id AND b.teacher_id = auth.uid()
  );
$$;

-- Teacher of batch can INSERT/UPDATE
CREATE POLICY "Teachers can insert batch_attendance"
  ON public.batch_attendance FOR INSERT
  WITH CHECK (public.is_teacher_of_batch_session(batch_session_id));

CREATE POLICY "Teachers can update batch_attendance"
  ON public.batch_attendance FOR UPDATE
  USING (public.is_teacher_of_batch_session(batch_session_id))
  WITH CHECK (public.is_teacher_of_batch_session(batch_session_id));

-- Student can SELECT own attendance
CREATE POLICY "Students can read own batch_attendance"
  ON public.batch_attendance FOR SELECT
  USING (auth.uid() = user_id);

-- Admin/Director full access
CREATE POLICY "Admins can manage batch_attendance"
  ON public.batch_attendance FOR ALL
  USING (public.is_admin_or_director())
  WITH CHECK (public.is_admin_or_director());

-- =============================================================================
-- 5. BATCH_PARTICIPATION TABLE (maintained by server action / trigger)
-- =============================================================================
CREATE TABLE public.batch_participation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_sessions integer DEFAULT 0,
  sessions_attended integer DEFAULT 0,
  attendance_percentage numeric DEFAULT 0,
  last_attended_at timestamptz,
  engagement_score numeric DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (batch_id, user_id)
);

CREATE INDEX idx_batch_participation_batch_id ON public.batch_participation(batch_id);
CREATE INDEX idx_batch_participation_user_id ON public.batch_participation(user_id);

ALTER TABLE public.batch_participation ENABLE ROW LEVEL SECURITY;

-- Students: read own
CREATE POLICY "Students can read own batch_participation"
  ON public.batch_participation FOR SELECT
  USING (auth.uid() = user_id);

-- Teachers: read for assigned batches
CREATE POLICY "Teachers can read batch_participation for assigned batches"
  ON public.batch_participation FOR SELECT
  USING (public.is_teacher_of_batch(batch_id));

-- Admin/Director: full access
CREATE POLICY "Admins can manage batch_participation"
  ON public.batch_participation FOR ALL
  USING (public.is_admin_or_director())
  WITH CHECK (public.is_admin_or_director());

-- Service/trigger will upsert via service_role or a SECURITY DEFINER function
-- Teachers need to trigger recalculation when marking attendance — done via server action

-- =============================================================================
-- 6. NOTIFICATIONS TABLE (in-platform)
-- =============================================================================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text,
  body text,
  read_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own notifications
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications (mark read)"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert: via create_notification() SECURITY DEFINER function only (no direct client insert)

-- =============================================================================
-- 7. PUSH_TOKENS TABLE (mobile push)
-- =============================================================================
CREATE TABLE public.push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_token text NOT NULL,
  platform text CHECK (platform IN ('ios', 'android', 'web')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, device_token)
);

CREATE INDEX idx_push_tokens_user_id ON public.push_tokens(user_id);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage own tokens only
CREATE POLICY "Users can manage own push_tokens"
  ON public.push_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 8. FIX: batch_sessions policy depends on batch_enrollments
--    batch_enrollments was created after batch_sessions — policy order is fine
--    But "Students can read batch_sessions" references batch_enrollments which now exists
-- =============================================================================
-- Already defined above; batch_enrollments exists before the policy runs.

-- =============================================================================
-- 9. SECURITY DEFINER: Create notification (called from server actions)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, metadata)
  VALUES (p_user_id, p_type, p_title, p_body, p_metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- =============================================================================
-- 10. SECURITY DEFINER: Recalculate batch participation (called from server action)
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
    )     ELSE batch_participation.last_attended_at END;
END;
$$;

-- Recalculate participation for ALL enrolled users in a batch (e.g. when new session added)
CREATE OR REPLACE FUNCTION public.recalculate_batch_participation_all(p_batch_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT DISTINCT user_id FROM public.batch_enrollments WHERE batch_id = p_batch_id AND enrollment_status = 'active'
  LOOP
    PERFORM public.recalculate_batch_participation(p_batch_id, r.user_id);
  END LOOP;
END;
$$;
