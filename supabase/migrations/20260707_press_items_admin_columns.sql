-- 20260707_press_items_admin_columns.sql
-- press_items already existed (earlier CMS phase, seeded with the same 6
-- items as the press MDX files but never wired to the page). Complete it
-- for admin management: enabled toggle (public sees only enabled rows),
-- optional bilingual section label, standard updated_at trigger.
-- Applied to prod via Supabase MCP apply_migration on 2026-07-07.

ALTER TABLE public.press_items
  ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS section jsonb DEFAULT '{}'::jsonb;

DROP POLICY IF EXISTS "Public read press_items" ON public.press_items;
CREATE POLICY "Public read press_items" ON public.press_items
  FOR SELECT USING (enabled = true);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.press_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
