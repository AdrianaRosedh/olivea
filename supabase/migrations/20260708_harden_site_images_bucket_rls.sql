-- ─────────────────────────────────────────────────────────────────────
-- SECURITY FIX (2026-07-08): the `site-images` storage bucket had
-- INSERT/UPDATE/DELETE policies named "Service role can …" but applied to the
-- `public` grant group and gated ONLY on bucket_id — no role check. With the
-- default anon grants (confirmed anon INSERT/UPDATE/DELETE = true), ANYONE with
-- the anon key could upload, overwrite, or delete site images. A broad SELECT
-- policy also let anon LIST every file (advisor: public_bucket_allows_listing).
--
-- Fix: gate all writes on service_role. Admin uploads/deletes go through the
-- service_role key via server actions (lib/supabase/storage.ts), which bypasses
-- RLS — unaffected. Drop the broad public listing policy: site-images is a
-- PUBLIC bucket, so object URLs are served without an RLS SELECT policy, and the
-- admin media library lists via a session-guarded service_role server action.
-- Verified after apply: public object URL still returns 200.
-- ─────────────────────────────────────────────────────────────────────

drop policy if exists "Public read access for site images" on storage.objects;

drop policy if exists "Service role can upload site images" on storage.objects;
create policy "Service role can upload site images" on storage.objects
  for insert to public
  with check (bucket_id = 'site-images' and auth.role() = 'service_role');

drop policy if exists "Service role can update site images" on storage.objects;
create policy "Service role can update site images" on storage.objects
  for update to public
  using (bucket_id = 'site-images' and auth.role() = 'service_role')
  with check (bucket_id = 'site-images' and auth.role() = 'service_role');

drop policy if exists "Service role can delete site images" on storage.objects;
create policy "Service role can delete site images" on storage.objects
  for delete to public
  using (bucket_id = 'site-images' and auth.role() = 'service_role');
