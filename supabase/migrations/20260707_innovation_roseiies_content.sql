-- 20260707_innovation_roseiies_content.sql
-- Innovation + roseiies page content — singleton tables matching the
-- established *_content pattern (id='singleton', jsonb per top-level key,
-- public read / service-role write, updated_at trigger).
-- Applied to prod via Supabase MCP apply_migration on 2026-07-07.

CREATE TABLE IF NOT EXISTS public.innovation_content (
  id text PRIMARY KEY DEFAULT 'singleton',
  meta jsonb DEFAULT '{}'::jsonb,
  hero jsonb DEFAULT '{}'::jsonb,
  craft jsonb DEFAULT '{}'::jsonb,
  technology jsonb DEFAULT '{}'::jsonb,
  quote jsonb DEFAULT '{}'::jsonb,
  method jsonb DEFAULT '{}'::jsonb,
  closing jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.roseiies_content (
  id text PRIMARY KEY DEFAULT 'singleton',
  meta jsonb DEFAULT '{}'::jsonb,
  hero jsonb DEFAULT '{}'::jsonb,
  founder jsonb DEFAULT '{}'::jsonb,
  sections jsonb DEFAULT '[]'::jsonb,
  beliefs jsonb DEFAULT '[]'::jsonb,
  cta jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.innovation_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roseiies_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read innovation_content" ON public.innovation_content
  FOR SELECT USING (true);
CREATE POLICY "Service role full innovation_content" ON public.innovation_content
  FOR ALL USING (true);

CREATE POLICY "Public read roseiies_content" ON public.roseiies_content
  FOR SELECT USING (true);
CREATE POLICY "Service role full roseiies_content" ON public.roseiies_content
  FOR ALL USING (true);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.innovation_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.roseiies_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
