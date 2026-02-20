-- Phase 3: Advanced Analytics Engine — materialized views
-- Run after 20250219000000_hybrid_batch_status_completion.sql

-- =============================================================================
-- 1. STUDENT DASHBOARD STATS
-- =============================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.student_dashboard_stats AS
SELECT
  be.user_id,
  COUNT(DISTINCT be.id)::int AS total_enrollments,
  COUNT(DISTINCT CASE WHEN bws.computed_status = 'active' THEN be.batch_id END)::int AS active_batches,
  COALESCE(AVG(bp.attendance_percentage), 0)::numeric(5,2) AS overall_attendance_avg,
  COUNT(DISTINCT CASE WHEN be.completion_status = 'completed' THEN be.batch_id END)::int AS completed_batches,
  COUNT(DISTINCT CASE WHEN be.completion_status = 'failed' THEN be.batch_id END)::int AS failed_batches,
  MAX(GREATEST(be.created_at, bp.updated_at)) AS last_activity_date
FROM public.batch_enrollments be
LEFT JOIN public.batch_with_status bws ON bws.id = be.batch_id
LEFT JOIN public.batch_participation bp ON bp.batch_id = be.batch_id AND bp.user_id = be.user_id
WHERE be.enrollment_status = 'active'
GROUP BY be.user_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_dashboard_stats_user_id
  ON public.student_dashboard_stats (user_id);

-- =============================================================================
-- 2. TEACHER BATCH STATS
-- =============================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.teacher_batch_stats AS
SELECT
  b.teacher_id AS user_id,
  COUNT(DISTINCT b.id)::int AS total_batches,
  COALESCE(AVG(sub.avg_att), 0)::numeric(5,2) AS avg_attendance_per_batch,
  COALESCE(SUM(sub.student_count), 0)::int AS total_students,
  COALESCE(SUM(sub.below_50), 0)::int AS students_below_50_percent,
  COALESCE(AVG(sub.session_consistency), 0)::numeric(5,2) AS session_consistency_score
FROM public.batches b
LEFT JOIN LATERAL (
  SELECT
    bp.batch_id,
    AVG(bp.attendance_percentage) AS avg_att,
    COUNT(DISTINCT bp.user_id)::int AS student_count,
    COUNT(DISTINCT CASE WHEN bp.attendance_percentage < 50 THEN bp.user_id END)::int AS below_50,
    CASE
      WHEN (SELECT COUNT(*) FROM public.batch_sessions WHERE batch_id = bp.batch_id) > 0
      THEN 100.0
      ELSE 0
    END AS session_consistency
  FROM public.batch_participation bp
  WHERE bp.batch_id = b.id
  GROUP BY bp.batch_id
) sub ON true
WHERE b.teacher_id IS NOT NULL AND b.is_active = true
GROUP BY b.teacher_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_teacher_batch_stats_user_id
  ON public.teacher_batch_stats (user_id);

-- =============================================================================
-- 3. PLATFORM ANALYTICS (Admin/Director)
-- =============================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.platform_analytics AS
SELECT
  (SELECT COUNT(*) FROM public.profiles)::int AS total_students,
  (SELECT COUNT(DISTINCT user_id) FROM public.batch_enrollments WHERE enrollment_status = 'active')::int AS active_students,
  (SELECT COUNT(*) FROM public.batches)::int AS total_batches,
  (SELECT COUNT(*) FROM public.batches WHERE is_active = true)::int AS active_batches,
  COALESCE((SELECT AVG(attendance_percentage) FROM public.batch_participation), 0)::numeric(5,2) AS platform_attendance_avg,
  (SELECT jsonb_agg(jsonb_build_object('month', month, 'count', cnt) ORDER BY month)
   FROM (SELECT DATE_TRUNC('month', created_at)::date AS month, COUNT(*)::int AS cnt
         FROM public.batch_enrollments WHERE created_at >= CURRENT_DATE - INTERVAL '12 months' GROUP BY 1) t) AS monthly_enrollment_trend,
  COALESCE((SELECT (COUNT(*) FILTER (WHERE completion_status = 'completed'))::numeric / NULLIF(COUNT(*) FILTER (WHERE completion_status IN ('completed','failed')), 0) * 100
            FROM public.batch_enrollments), 0)::numeric(5,2) AS completion_rate,
  COALESCE((SELECT (COUNT(*) FILTER (WHERE completion_status = 'failed'))::numeric / NULLIF(COUNT(*), 0) * 100
            FROM public.batch_enrollments), 0)::numeric(5,2) AS dropout_rate;

-- RLS: Materialized views don't support RLS. Use SECURITY DEFINER functions for safe access.
CREATE OR REPLACE FUNCTION public.get_my_student_dashboard_stats()
RETURNS SETOF public.student_dashboard_stats
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT * FROM public.student_dashboard_stats WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_teacher_batch_stats()
RETURNS SETOF public.teacher_batch_stats
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT * FROM public.teacher_batch_stats WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_platform_analytics()
RETURNS SETOF public.platform_analytics
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE AS $$
BEGIN
  IF NOT public.is_admin_or_director() THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT * FROM public.platform_analytics;
END;
$$;

-- =============================================================================
-- 4. REFRESH FUNCTION (call periodically or on-demand)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.refresh_analytics_views()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.student_dashboard_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.teacher_batch_stats;
  -- platform_analytics is single-row, no unique index needed for simple refresh
  REFRESH MATERIALIZED VIEW public.platform_analytics;
END;
$$;
