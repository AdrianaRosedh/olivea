-- ─────────────────────────────────────────────────────────────────────
-- SECURITY FIX (2026-07-08): 15 singleton/content tables had an "ALL" RLS
-- policy with USING (true) WITH CHECK (true) applied to the `public` grant
-- group, which includes the `anon` role (the public browser API key).
-- Combined with the default anon table grants, this let ANYONE with the anon
-- key INSERT/UPDATE/DELETE all site content (incl. global_settings hours/NAP).
-- The policy was NAMED "Service role full …" but its expression restricted
-- nothing. Confirmed exploitable: has_table_privilege('anon', …, 'UPDATE') = true.
--
-- Fix: restrict the write policies to the service_role (matching the safe
-- pattern already used by banners/popups/careers/hero_videos/home_content).
-- Admin writes use the service_role key (which bypasses RLS), so saving is
-- unaffected. The separate "Public read …" SELECT policies are left intact.
--
-- Also pins the search_path on the shared updated_at trigger function
-- (advisor: function_search_path_mutable).
-- ─────────────────────────────────────────────────────────────────────

do $$
declare
  t text;
  tables text[] := array[
    'cafe_content','casa_content','contact_content','drawer_content',
    'farmtotable_content','footer_content','global_settings','innovation_content',
    'legal_content','not_found_content','press_content','roseiies_content',
    'sustainability_content','sustainability_sections','team_content'
  ];
begin
  foreach t in array tables loop
    execute format('drop policy if exists %I on public.%I', 'Service role full '||t, t);
    execute format(
      'create policy %I on public.%I for all to public '
      || 'using (auth.role() = ''service_role'') '
      || 'with check (auth.role() = ''service_role'')',
      'Service role full '||t, t
    );
  end loop;
end $$;

alter function public.update_updated_at() set search_path = pg_catalog;
