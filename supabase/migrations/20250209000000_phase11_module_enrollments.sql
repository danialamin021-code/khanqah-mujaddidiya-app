-- Phase 11: Module enrollments — real enrollment data for learning modules.
-- Run after Phase-10.

CREATE TABLE public.module_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, user_id)
);

CREATE INDEX idx_module_enrollments_module_id ON public.module_enrollments(module_id);
CREATE INDEX idx_module_enrollments_user_id ON public.module_enrollments(user_id);

ALTER TABLE public.module_enrollments ENABLE ROW LEVEL SECURITY;

-- 1) Students: SELECT where auth.uid() = user_id
CREATE POLICY "Students can read own enrollments"
  ON public.module_enrollments FOR SELECT
  USING (auth.uid() = user_id);

-- 2) Teachers: SELECT where assigned to module
CREATE POLICY "Teachers can read enrollments for assigned modules"
  ON public.module_enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.module_teachers mt
      WHERE mt.user_id = auth.uid()
      AND mt.module_id = module_enrollments.module_id
    )
  );

-- 3) Admin / Director: full access
CREATE POLICY "Admins can read module_enrollments"
  ON public.module_enrollments FOR SELECT
  USING (public.is_admin_or_director());

CREATE POLICY "Admins can insert module_enrollments"
  ON public.module_enrollments FOR INSERT
  WITH CHECK (public.is_admin_or_director());

CREATE POLICY "Admins can update module_enrollments"
  ON public.module_enrollments FOR UPDATE
  USING (public.is_admin_or_director())
  WITH CHECK (public.is_admin_or_director());

CREATE POLICY "Admins can delete module_enrollments"
  ON public.module_enrollments FOR DELETE
  USING (public.is_admin_or_director());

-- 4) Insert: authenticated users can insert when user_id = auth.uid()
CREATE POLICY "Users can enroll self in module"
  ON public.module_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);
