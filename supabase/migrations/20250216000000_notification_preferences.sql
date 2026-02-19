-- User notification preferences (email, etc.)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notify_announcements boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_events boolean NOT NULL DEFAULT true;

-- Allow users to update their own notification preferences
CREATE POLICY "Users can update own notification preferences"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
