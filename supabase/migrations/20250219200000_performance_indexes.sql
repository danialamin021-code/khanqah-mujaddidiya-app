-- Phase 6: Performance optimization — indexes, pagination support
-- Run after 20250219100000_analytics_views.sql

-- Additional indexes for batch system
CREATE INDEX IF NOT EXISTS idx_batches_status ON public.batches(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_batch_status ON public.batch_enrollments(batch_id, enrollment_status);
CREATE INDEX IF NOT EXISTS idx_batch_participation_attendance ON public.batch_participation(batch_id, attendance_percentage);

-- Ensure existing indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_batch_attendance_session_user ON public.batch_attendance(batch_session_id, user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id) WHERE read_at IS NULL;
