-- Add enrollment metadata to module_enrollments (full name, WhatsApp, country, city).

alter table public.module_enrollments
  add column if not exists full_name text,
  add column if not exists whatsapp text,
  add column if not exists country text,
  add column if not exists city text;
