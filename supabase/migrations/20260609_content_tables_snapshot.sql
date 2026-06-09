-- Migration: content tables snapshot
-- Point-in-time snapshot of the production public schema (June 9, 2026).
-- Backfills the 26 content tables that predate this migrations directory so a
-- fresh database can be brought up to match prod. admin_users and
-- admin_audit_log are NOT included here — they live in 20260418_admin_users.sql.
--
-- Every statement is idempotent: the file runs cleanly both on a fresh
-- database and on current prod (create table if not exists, create or replace
-- for the trigger function and triggers, and DO-blocks guarding policies and
-- foreign keys, since CREATE POLICY / ADD CONSTRAINT have no IF NOT EXISTS).
--
-- Notes:
--   * Defaults, constraint names, policy names/roles/expressions, and trigger
--     names are reproduced exactly as Postgres reports them in prod.
--   * At snapshot time the only indexes on these tables were the ones backing
--     primary key / unique constraints, so no standalone CREATE INDEX is needed.
--   * create or replace trigger requires Postgres 14+ (Supabase is 15+).
-- ─────────────────────────────────────────────────────────────

-- Shared trigger function: keeps updated_at current on row updates.
-- Reproduced exactly as reported by pg_get_functiondef in prod.
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- ── banners ──────────────────────────────────────────────────

create table if not exists banners (
  id text primary key,
  enabled boolean not null default false,
  type text not null
    constraint banners_type_check check (type in ('notice', 'promo', 'warning')),
  translations jsonb not null,
  starts_at timestamptz,
  ends_at timestamptz,
  dismissible boolean not null default true,
  include_paths text[],
  exclude_paths text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table banners enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'banners'
      and policyname = 'Public can read enabled banners'
  ) then
    create policy "Public can read enabled banners"
      on banners for select
      to public
      using (enabled = true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'banners'
      and policyname = 'Service role full access banners'
  ) then
    create policy "Service role full access banners"
      on banners for all
      to public
      using (auth.role() = 'service_role'::text);
  end if;
end $$;

create or replace trigger banners_updated_at
  before update on banners
  for each row execute function update_updated_at();

-- ── cafe_content ─────────────────────────────────────────────

create table if not exists cafe_content (
  id text primary key default 'singleton'::text,
  meta jsonb not null default '{}'::jsonb,
  hero jsonb not null default '{}'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  faq jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table cafe_content enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'cafe_content'
      and policyname = 'Public read cafe_content'
  ) then
    create policy "Public read cafe_content"
      on cafe_content for select
      to public
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'cafe_content'
      and policyname = 'Service role full cafe_content'
  ) then
    create policy "Service role full cafe_content"
      on cafe_content for all
      to public
      using (true)
      with check (true);
  end if;
end $$;

create or replace trigger set_updated_at
  before update on cafe_content
  for each row execute function update_updated_at();

-- ── careers_content ──────────────────────────────────────────

create table if not exists careers_content (
  id text primary key default 'careers'::text,
  meta jsonb not null,
  hero jsonb not null,
  standards jsonb not null,
  hiring_steps jsonb not null,
  principles jsonb not null,
  tracks jsonb not null,
  openings jsonb not null,
  application jsonb not null,
  updated_at timestamptz not null default now()
);

alter table careers_content enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'careers_content'
      and policyname = 'Public can read careers'
  ) then
    create policy "Public can read careers"
      on careers_content for select
      to public
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'careers_content'
      and policyname = 'Service role full access careers'
  ) then
    create policy "Service role full access careers"
      on careers_content for all
      to public
      using (auth.role() = 'service_role'::text);
  end if;
end $$;

create or replace trigger careers_content_updated_at
  before update on careers_content
  for each row execute function update_updated_at();

-- ── casa_content ─────────────────────────────────────────────

create table if not exists casa_content (
  id text primary key default 'singleton'::text,
  meta jsonb not null default '{}'::jsonb,
  hero jsonb not null default '{}'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table casa_content enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'casa_content'
      and policyname = 'Public read casa_content'
  ) then
    create policy "Public read casa_content"
      on casa_content for select
      to public
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'casa_content'
      and policyname = 'Service role full casa_content'
  ) then
    create policy "Service role full casa_content"
      on casa_content for all
      to public
      using (true)
      with check (true);
  end if;
end $$;

create or replace trigger set_updated_at
  before update on casa_content
  for each row execute function update_updated_at();

-- ── casa_faq ─────────────────────────────────────────────────

create table if not exists casa_faq (
  id text primary key,
  page text not null default 'casa'::text,
  question jsonb not null,
  answer jsonb not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table casa_faq enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'casa_faq'
      and policyname = 'Public can read FAQ'
  ) then
    create policy "Public can read FAQ"
      on casa_faq for select
      to public
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'casa_faq'
      and policyname = 'Service role full access casa_faq'
  ) then
    create policy "Service role full access casa_faq"
      on casa_faq for all
      to public
      using (auth.role() = 'service_role'::text);
  end if;
end $$;

create or replace trigger casa_faq_updated_at
  before update on casa_faq
  for each row execute function update_updated_at();

-- ── contact_content ──────────────────────────────────────────

create table if not exists contact_content (
  id text primary key default 'singleton'::text,
  meta jsonb not null default '{}'::jsonb,
  kicker jsonb not null default '{}'::jsonb,
  subtitle jsonb not null default '{}'::jsonb,
  actions jsonb not null default '{}'::jsonb,
  labels jsonb not null default '{}'::jsonb,
  sections jsonb not null default '{}'::jsonb,
  footer_note jsonb not null default '{}'::jsonb,
  map jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table contact_content enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'contact_content'
      and policyname = 'Public read contact_content'
  ) then
    create policy "Public read contact_content"
      on contact_content for select
      to public
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'contact_content'
      and policyname = 'Service role full contact_content'
  ) then
    create policy "Service role full contact_content"
      on contact_content for all
      to public
      using (true)
      with check (true);
  end if;
end $$;

create or replace trigger set_updated_at
  before update on contact_content
  for each row execute function update_updated_at();

-- ── drawer_content ───────────────────────────────────────────

create table if not exists drawer_content (
  id text primary key default 'singleton'::text,
  main_links jsonb not null default '[]'::jsonb,
  more_links jsonb not null default '[]'::jsonb,
  copyright jsonb not null default '{}'::jsonb,
  see_more jsonb not null default '{}'::jsonb,
  hide jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table drawer_content enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'drawer_content'
      and policyname = 'Public read drawer_content'
  ) then
    create policy "Public read drawer_content"
      on drawer_content for select
      to public
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'drawer_content'
      and policyname = 'Service role full drawer_content'
  ) then
    create policy "Service role full drawer_content"
      on drawer_content for all
      to public
      using (true)
      with check (true);
  end if;
end $$;

create or replace trigger set_updated_at
  before update on drawer_content
  for each row execute function update_updated_at();

-- ── drinks ───────────────────────────────────────────────────

create table if not exists drinks (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  description text,
  price numeric,
  tags text[] default '{}'::text[],
  available boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table drinks enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'drinks'
      and policyname = 'Public can read available drinks'
  ) then
    create policy "Public can read available drinks"
      on drinks for select
      to public
      using (available = true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'drinks'
      and policyname = 'Service role full access drinks'
  ) then
    create policy "Service role full access drinks"
      on drinks for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;

-- ── farmtotable_content ──────────────────────────────────────

create table if not exists farmtotable_content (
  id text primary key default 'singleton'::text,
  meta jsonb not null default '{}'::jsonb,
  hero jsonb not null default '{}'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  faq jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table farmtotable_content enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'farmtotable_content'
      and policyname = 'Public read farmtotable_content'
  ) then
    create policy "Public read farmtotable_content"
      on farmtotable_content for select
      to public
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'farmtotable_content'
      and policyname = 'Service role full farmtotable_content'
  ) then
    create policy "Service role full farmtotable_content"
      on farmtotable_content for all
      to public
      using (true)
      with check (true);
  end if;
end $$;

create or replace trigger set_updated_at
  before update on farmtotable_content
  for each row execute function update_updated_at();

-- ── footer_content ───────────────────────────────────────────

create table if not exists footer_content (
  id text primary key default 'singleton'::text,
  careers jsonb not null default '{}'::jsonb,
  legal jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table footer_content enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'footer_content'
      and policyname = 'Public read footer_content'
  ) then
    create policy "Public read footer_content"
      on footer_content for select
      to public
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'footer_content'
      and policyname = 'Service role full footer_content'
  ) then
    create policy "Service role full footer_content"
      on footer_content for all
      to public
      using (true)
      with check (true);
  end if;
end $$;

create or replace trigger set_updated_at
  before update on footer_content
  for each row execute function update_updated_at();

-- ── global_settings ──────────────────────────────────────────

create table if not exists global_settings (
  id text primary key default 'singleton'::text,
  site_name text not null default 'OLIVEA'::text,
  tagline jsonb not null default '{}'::jsonb,
  default_locale text not null default 'es'::text,
  contact_info jsonb not null default '{}'::jsonb,
  hours jsonb not null default '[]'::jsonb,
  socials jsonb not null default '[]'::jsonb,
  default_og_image text not null default '/images/og/cover.jpg'::text,
  twitter_handle text not null default ''::text,
  updated_at timestamptz not null default now()
);

alter table global_settings enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'global_settings'
      and policyname = 'Public read global_settings'
  ) then
    create policy "Public read global_settings"
      on global_settings for select
      to public
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'global_settings'
      and policyname = 'Service role full global_settings'
  ) then
    create policy "Service role full global_settings"
      on global_settings for all
      to public
      using (true)
      with check (true);
  end if;
end $$;

create or replace trigger set_updated_at
  before update on global_settings
  for each row execute function update_updated_at();

-- ── hero_videos ──────────────────────────────────────────────

create table if not exists hero_videos (
  id text primary key,
  label jsonb not null,
  mobile jsonb not null,
  desktop jsonb not null,
  version text not null,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table hero_videos enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'hero_videos'
      and policyname = 'Public can read active videos'
  ) then
    create policy "Public can read active videos"
      on hero_videos for select
      to public
      using (active = true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'hero_videos'
      and policyname = 'Service role full access hero_videos'
  ) then
    create policy "Service role full access hero_videos"
      on hero_videos for all
      to public
      using (auth.role() = 'service_role'::text);
  end if;
end $$;

create or replace trigger hero_videos_updated_at
  before update on hero_videos
  for each row execute function update_updated_at();

-- ── home_content ─────────────────────────────────────────────

create table if not exists home_content (
  id text primary key default 'home'::text,
  meta jsonb not null,
  hero jsonb not null,
  updated_at timestamptz not null default now()
);

alter table home_content enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'home_content'
      and policyname = 'Public can read home'
  ) then
    create policy "Public can read home"
      on home_content for select
      to public
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'home_content'
      and policyname = 'Service role full access home'
  ) then
    create policy "Service role full access home"
      on home_content for all
      to public
      using (auth.role() = 'service_role'::text);
  end if;
end $$;

create or replace trigger home_content_updated_at
  before update on home_content
  for each row execute function update_updated_at();

-- ── job_applications ─────────────────────────────────────────
-- (the opening_id foreign key is added after job_openings below,
--  so this file also runs in order on a fresh database)

create table if not exists job_applications (
  id uuid primary key default gen_random_uuid(),
  opening_id uuid,
  name text not null default ''::text,
  email text not null default ''::text,
  phone text not null default ''::text,
  area text not null default ''::text,
  cover_note text not null default ''::text,
  resume_url text,
  status text not null default 'applied'::text
    constraint job_applications_status_check
    check (status in ('applied', 'reviewing', 'interview', 'offer', 'hired', 'rejected')),
  notes jsonb not null default '[]'::jsonb,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table job_applications enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'job_applications'
      and policyname = 'Service role full access job_applications'
  ) then
    create policy "Service role full access job_applications"
      on job_applications for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;

-- ── job_openings ─────────────────────────────────────────────

create table if not exists job_openings (
  id uuid primary key default gen_random_uuid(),
  title_es text not null default ''::text,
  title_en text not null default ''::text,
  area text not null default ''::text,
  type text not null default 'full-time'::text
    constraint job_openings_type_check
    check (type in ('full-time', 'part-time', 'seasonal', 'internship')),
  description_es text not null default ''::text,
  description_en text not null default ''::text,
  requirements_es text not null default ''::text,
  requirements_en text not null default ''::text,
  location text not null default 'Valle de Guadalupe'::text,
  status text not null default 'draft'::text
    constraint job_openings_status_check
    check (status in ('draft', 'live', 'closed')),
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table job_openings enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'job_openings'
      and policyname = 'Public can read live job openings'
  ) then
    create policy "Public can read live job openings"
      on job_openings for select
      to public
      using (status = 'live'::text);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'job_openings'
      and policyname = 'Service role full access job_openings'
  ) then
    create policy "Service role full access job_openings"
      on job_openings for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;

-- foreign key for job_applications.opening_id (added here so that
-- both tables already exist when the constraint is created)
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'job_applications_opening_id_fkey'
      and conrelid = 'public.job_applications'::regclass
  ) then
    alter table job_applications
      add constraint job_applications_opening_id_fkey
      foreign key (opening_id) references job_openings(id) on delete set null;
  end if;
end $$;

-- ── journal_posts ────────────────────────────────────────────

create table if not exists journal_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null
    constraint journal_posts_slug_key unique,
  title_es text not null default ''::text,
  title_en text not null default ''::text,
  excerpt_es text not null default ''::text,
  excerpt_en text not null default ''::text,
  body_es text not null default ''::text,
  body_en text not null default ''::text,
  cover_image text,
  author text default 'Adriana Rose'::text,
  tags text[] default '{}'::text[],
  status text default 'draft'::text
    constraint journal_posts_status_check
    check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  authors jsonb,
  gallery jsonb,
  cover_alt text
);

alter table journal_posts enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'journal_posts'
      and policyname = 'Public can read published journal posts'
  ) then
    create policy "Public can read published journal posts"
      on journal_posts for select
      to public
      using (status = 'published'::text);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'journal_posts'
      and policyname = 'Service role full access journal_posts'
  ) then
    create policy "Service role full access journal_posts"
      on journal_posts for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;

-- ── legal_content ────────────────────────────────────────────

create table if not exists legal_content (
  id text primary key default 'singleton'::text,
  meta jsonb not null default '{}'::jsonb,
  title jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table legal_content enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'legal_content'
      and policyname = 'Public read legal_content'
  ) then
    create policy "Public read legal_content"
      on legal_content for select
      to public
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'legal_content'
      and policyname = 'Service role full legal_content'
  ) then
    create policy "Service role full legal_content"
      on legal_content for all
      to public
      using (true)
      with check (true);
  end if;
end $$;

create or replace trigger set_updated_at
  before update on legal_content
  for each row execute function update_updated_at();

-- ── not_found_content ────────────────────────────────────────

create table if not exists not_found_content (
  id text primary key default 'singleton'::text,
  meta jsonb not null default '{}'::jsonb,
  message jsonb not null default '{}'::jsonb,
  cta jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table not_found_content enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'not_found_content'
      and policyname = 'Public read not_found_content'
  ) then
    create policy "Public read not_found_content"
      on not_found_content for select
      to public
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'not_found_content'
      and policyname = 'Service role full not_found_content'
  ) then
    create policy "Service role full not_found_content"
      on not_found_content for all
      to public
      using (true)
      with check (true);
  end if;
end $$;

create or replace trigger set_updated_at
  before update on not_found_content
  for each row execute function update_updated_at();

-- ── page_content ─────────────────────────────────────────────

create table if not exists page_content (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  section text not null,
  content_es jsonb not null default '{}'::jsonb,
  content_en jsonb not null default '{}'::jsonb,
  sort_order integer default 0,
  status text default 'published'::text
    constraint page_content_status_check
    check (status in ('draft', 'published')),
  updated_at timestamptz default now(),
  constraint page_content_page_section_key unique (page, section)
);

alter table page_content enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'page_content'
      and policyname = 'Public can read published page_content'
  ) then
    create policy "Public can read published page_content"
      on page_content for select
      to public
      using (status = 'published'::text);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'page_content'
      and policyname = 'Service role full access page_content'
  ) then
    create policy "Service role full access page_content"
      on page_content for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;

-- ── popups ───────────────────────────────────────────────────

create table if not exists popups (
  id text primary key,
  enabled boolean not null default false,
  kind text not null
    constraint popups_kind_check check (kind in ('journal', 'announcement')),
  priority integer not null default 100,
  translations jsonb not null,
  media jsonb,
  rules jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table popups enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'popups'
      and policyname = 'Public can read enabled popups'
  ) then
    create policy "Public can read enabled popups"
      on popups for select
      to public
      using (enabled = true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'popups'
      and policyname = 'Service role full access popups'
  ) then
    create policy "Service role full access popups"
      on popups for all
      to public
      using (auth.role() = 'service_role'::text);
  end if;
end $$;

create or replace trigger popups_updated_at
  before update on popups
  for each row execute function update_updated_at();

-- ── press_content ────────────────────────────────────────────

create table if not exists press_content (
  id text primary key default 'singleton'::text,
  meta jsonb not null default '{}'::jsonb,
  title jsonb not null default '{}'::jsonb,
  tagline jsonb not null default '{}'::jsonb,
  description jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table press_content enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'press_content'
      and policyname = 'Public read press_content'
  ) then
    create policy "Public read press_content"
      on press_content for select
      to public
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'press_content'
      and policyname = 'Service role full press_content'
  ) then
    create policy "Service role full press_content"
      on press_content for all
      to public
      using (true)
      with check (true);
  end if;
end $$;

create or replace trigger set_updated_at
  before update on press_content
  for each row execute function update_updated_at();

-- ── press_items ──────────────────────────────────────────────

create table if not exists press_items (
  id text primary key,
  kind text not null default 'award'::text,
  published_at date,
  issuer text not null,
  target text not null default 'restaurant'::text,
  title jsonb not null default '{"en": "", "es": ""}'::jsonb,
  blurb jsonb not null default '{"en": "", "es": ""}'::jsonb,
  tags text[] default '{}'::text[],
  links jsonb default '[]'::jsonb,
  cover jsonb,
  starred boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table press_items enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'press_items'
      and policyname = 'Public read press_items'
  ) then
    create policy "Public read press_items"
      on press_items for select
      to public
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'press_items'
      and policyname = 'Service role write press_items'
  ) then
    create policy "Service role write press_items"
      on press_items for all
      to public
      using (auth.role() = 'service_role'::text)
      with check (auth.role() = 'service_role'::text);
  end if;
end $$;

-- ── sustainability_content ───────────────────────────────────

create table if not exists sustainability_content (
  id text primary key default 'singleton'::text,
  meta jsonb not null default '{}'::jsonb,
  title jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table sustainability_content enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'sustainability_content'
      and policyname = 'Public read sustainability_content'
  ) then
    create policy "Public read sustainability_content"
      on sustainability_content for select
      to public
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'sustainability_content'
      and policyname = 'Service role full sustainability_content'
  ) then
    create policy "Service role full sustainability_content"
      on sustainability_content for all
      to public
      using (true)
      with check (true);
  end if;
end $$;

create or replace trigger set_updated_at
  before update on sustainability_content
  for each row execute function update_updated_at();

-- ── sustainability_sections ──────────────────────────────────

create table if not exists sustainability_sections (
  id text primary key default (gen_random_uuid())::text,
  sort_order integer not null default 0,
  title jsonb not null default '{}'::jsonb,
  subtitle jsonb,
  signals jsonb,
  practices jsonb,
  body jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table sustainability_sections enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'sustainability_sections'
      and policyname = 'Public read sustainability_sections'
  ) then
    create policy "Public read sustainability_sections"
      on sustainability_sections for select
      to public
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'sustainability_sections'
      and policyname = 'Service role full sustainability_sections'
  ) then
    create policy "Service role full sustainability_sections"
      on sustainability_sections for all
      to public
      using (true)
      with check (true);
  end if;
end $$;

create or replace trigger set_updated_at
  before update on sustainability_sections
  for each row execute function update_updated_at();

-- ── team_content ─────────────────────────────────────────────

create table if not exists team_content (
  id text primary key default 'singleton'::text,
  meta jsonb not null default '{}'::jsonb,
  title jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table team_content enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'team_content'
      and policyname = 'Public read team_content'
  ) then
    create policy "Public read team_content"
      on team_content for select
      to public
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'team_content'
      and policyname = 'Service role full team_content'
  ) then
    create policy "Service role full team_content"
      on team_content for all
      to public
      using (true)
      with check (true);
  end if;
end $$;

create or replace trigger set_updated_at
  before update on team_content
  for each row execute function update_updated_at();

-- ── wines ────────────────────────────────────────────────────

create table if not exists wines (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  winery text not null default ''::text,
  grape text,
  year integer,
  price_glass numeric,
  price_bottle numeric,
  tags text[] default '{}'::text[],
  available boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table wines enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'wines'
      and policyname = 'Public can read available wines'
  ) then
    create policy "Public can read available wines"
      on wines for select
      to public
      using (available = true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'wines'
      and policyname = 'Service role full access wines'
  ) then
    create policy "Service role full access wines"
      on wines for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;
