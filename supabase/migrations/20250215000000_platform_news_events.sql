-- Platform news (global announcements) and events.

-- Platform news: title, excerpt, body, date — for News & Updates on Home
CREATE TABLE public.platform_news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  published_at timestamptz NOT NULL DEFAULT now(),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_platform_news_published ON public.platform_news(published_at DESC);

ALTER TABLE public.platform_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform_news"
  ON public.platform_news FOR SELECT USING (true);

CREATE POLICY "Admins can insert platform_news"
  ON public.platform_news FOR INSERT WITH CHECK (public.is_admin_or_director());

CREATE POLICY "Admins can update platform_news"
  ON public.platform_news FOR UPDATE
  USING (public.is_admin_or_director())
  WITH CHECK (public.is_admin_or_director());

CREATE POLICY "Admins can delete platform_news"
  ON public.platform_news FOR DELETE USING (public.is_admin_or_director());

CREATE TRIGGER platform_news_updated_at
  BEFORE UPDATE ON public.platform_news
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Events: title, description, date, time, location — for events calendar
CREATE TABLE public.platform_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  event_date date NOT NULL,
  event_time time,
  location text,
  url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_platform_events_date ON public.platform_events(event_date);

ALTER TABLE public.platform_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform_events"
  ON public.platform_events FOR SELECT USING (true);

CREATE POLICY "Admins can insert platform_events"
  ON public.platform_events FOR INSERT WITH CHECK (public.is_admin_or_director());

CREATE POLICY "Admins can update platform_events"
  ON public.platform_events FOR UPDATE
  USING (public.is_admin_or_director())
  WITH CHECK (public.is_admin_or_director());

CREATE POLICY "Admins can delete platform_events"
  ON public.platform_events FOR DELETE USING (public.is_admin_or_director());

CREATE TRIGGER platform_events_updated_at
  BEFORE UPDATE ON public.platform_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
