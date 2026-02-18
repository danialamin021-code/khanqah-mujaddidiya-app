-- Bayat and Guidance request tables for human review workflow.

-- Bayat requests
CREATE TABLE public.bayat_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  whatsapp text NOT NULL,
  country text,
  city text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'responded')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  response_notes text,
  responded_at timestamptz,
  responded_by uuid REFERENCES auth.users(id)
);

CREATE INDEX idx_bayat_requests_user_id ON public.bayat_requests(user_id);
CREATE INDEX idx_bayat_requests_status ON public.bayat_requests(status);

ALTER TABLE public.bayat_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bayat_requests"
  ON public.bayat_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bayat_requests"
  ON public.bayat_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read bayat_requests"
  ON public.bayat_requests FOR SELECT
  USING (public.is_admin_or_director());

CREATE POLICY "Admins can update bayat_requests"
  ON public.bayat_requests FOR UPDATE
  USING (public.is_admin_or_director())
  WITH CHECK (public.is_admin_or_director());

-- Guidance requests
CREATE TABLE public.guidance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  whatsapp text NOT NULL,
  country text,
  city text,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'responded')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  response_notes text,
  responded_at timestamptz,
  responded_by uuid REFERENCES auth.users(id)
);

CREATE INDEX idx_guidance_requests_user_id ON public.guidance_requests(user_id);
CREATE INDEX idx_guidance_requests_status ON public.guidance_requests(status);

ALTER TABLE public.guidance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own guidance_requests"
  ON public.guidance_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own guidance_requests"
  ON public.guidance_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read guidance_requests"
  ON public.guidance_requests FOR SELECT
  USING (public.is_admin_or_director());

CREATE POLICY "Admins can update guidance_requests"
  ON public.guidance_requests FOR UPDATE
  USING (public.is_admin_or_director())
  WITH CHECK (public.is_admin_or_director());
