-- Production Hardening: RLS corrections
-- Run after all existing migrations.
-- Fixes: module_attendance (students/teachers isolation), profiles (prevent role escalation via notification prefs).

-- =============================================================================
-- 1. MODULE_ATTENDANCE — Restrict SELECT to own data (students) or assigned modules (teachers)
-- =============================================================================
-- Drop broad policy
DROP POLICY IF EXISTS "Anyone authenticated can read module_attendance" ON public.module_attendance;

-- Students: only their own attendance
CREATE POLICY "Students can read own module_attendance"
  ON public.module_attendance FOR SELECT
  USING (auth.uid() = user_id);

-- Teachers: attendance for sessions in assigned modules
CREATE POLICY "Teachers can read attendance for assigned modules"
  ON public.module_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.module_sessions s
      WHERE s.id = module_attendance.session_id
      AND public.can_access_module_as_teacher(s.module_id)
    )
  );

-- Admins/directors: full read (via is_admin_or_director)
CREATE POLICY "Admins can read all module_attendance"
  ON public.module_attendance FOR SELECT
  USING (public.is_admin_or_director());

-- =============================================================================
-- 2. PROFILES — Prevent role escalation via "notification preferences" policy
-- =============================================================================
-- The "Users can update own notification preferences" policy was too permissive (allowed any column update).
-- Add trigger to block role/role_request changes by non-admin.

CREATE OR REPLACE FUNCTION public.protect_profile_roles_on_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Admins/directors can change anything
  IF public.is_admin_or_director() THEN
    RETURN NEW;
  END IF;

  -- Non-admin: only allow changes to notify_announcements, notify_events, full_name, email
  -- Block changes to roles, role_request
  IF OLD.roles IS DISTINCT FROM NEW.roles OR OLD.role_request IS DISTINCT FROM NEW.role_request THEN
    RAISE EXCEPTION 'Only Admin or Director can modify roles or role_request';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_roles_update ON public.profiles;
CREATE TRIGGER protect_profile_roles_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_roles_on_update();

-- =============================================================================
-- 3. PERFORMANCE — Missing indexes (Phase 9)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_module_attendance_user_id ON public.module_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON public.profiles USING gin(roles);
