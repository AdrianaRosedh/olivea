-- ─────────────────────────────────────────────────────────────────────
-- PERFORMANCE PASS (2026-07-08) — resolves Supabase performance advisors
-- (multiple_permissive_policies 111→0, auth_rls_initplan 10→0, unindexed FK)
-- and fixes a latent RLS recursion on admin_users. Security is unchanged
-- (anon still cannot write; public reads still work; verified).
--
-- Represents the net end state (applied to prod as 3 sequential migrations).
-- ─────────────────────────────────────────────────────────────────────

-- 1) CMS "service write" policies → TO service_role. They were FOR ALL TO public
--    USING(auth.role()='service_role'), overlapping the public-read SELECT policy
--    for every role and re-evaluating auth.role() per row. Admin writes use the
--    service_role key (bypasses RLS), so these only need to exist for service_role.
--    anon/authenticated get no write policy → still denied.
do $$
declare r record;
begin
  for r in
    select tablename, policyname
    from pg_policies
    where schemaname='public' and cmd='ALL'
      and (policyname like 'Service role full %' or policyname like 'Service role write %')
      and tablename in (
        'cafe_content','casa_content','contact_content','drawer_content',
        'farmtotable_content','footer_content','global_settings','innovation_content',
        'legal_content','not_found_content','press_content','roseiies_content',
        'sustainability_content','sustainability_sections','team_content',
        'banners','careers_content','casa_faq','hero_videos','home_content',
        'popups','press_items'
      )
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
    execute format(
      'create policy %I on public.%I for all to service_role using (true) with check (true)',
      r.policyname, r.tablename
    );
  end loop;
end $$;

-- 2) storage site-images write policies: wrap auth.role() in (select …)
--    (storage.objects is multi-row, so per-row re-eval matters). Scope unchanged.
drop policy if exists "Service role can upload site images" on storage.objects;
create policy "Service role can upload site images" on storage.objects
  for insert to public
  with check (bucket_id = 'site-images' and (select auth.role()) = 'service_role');

drop policy if exists "Service role can update site images" on storage.objects;
create policy "Service role can update site images" on storage.objects
  for update to public
  using (bucket_id = 'site-images' and (select auth.role()) = 'service_role')
  with check (bucket_id = 'site-images' and (select auth.role()) = 'service_role');

drop policy if exists "Service role can delete site images" on storage.objects;
create policy "Service role can delete site images" on storage.objects
  for delete to public
  using (bucket_id = 'site-images' and (select auth.role()) = 'service_role');

-- 3) admin_audit_log: wrap auth.uid() in (select …) — this table grows, so the
--    read-policy per-row re-eval is a genuine future win. Access logic unchanged.
drop policy if exists "Owners and managers can read audit logs" on public.admin_audit_log;
create policy "Owners and managers can read audit logs" on public.admin_audit_log
  for select to public
  using (exists (select 1 from public.admin_users
                 where admin_users.id = (select auth.uid())
                   and admin_users.role = any (array['owner','manager'])));

drop policy if exists "Authenticated users can insert audit logs" on public.admin_audit_log;
create policy "Authenticated users can insert audit logs" on public.admin_audit_log
  for insert to public
  with check ((select auth.uid()) is not null);

-- 4) admin_users: the old "Owners can manage admin users" was FOR ALL, so its
--    USING ran on SELECT too, recursing (`select from admin_users` inside a
--    policy ON admin_users) → "infinite recursion detected". Scope owner
--    management to write commands only; SELECT is served by "Authenticated users
--    can read admin profiles" (USING true), so the inner select is non-recursive.
drop policy if exists "Owners can manage admin users" on public.admin_users;

create policy "Owners can insert admin users" on public.admin_users
  for insert to authenticated
  with check (exists (select 1 from public.admin_users au
                      where au.id = (select auth.uid()) and au.role = 'owner'));

create policy "Owners can update admin users" on public.admin_users
  for update to authenticated
  using (exists (select 1 from public.admin_users au
                 where au.id = (select auth.uid()) and au.role = 'owner'))
  with check (exists (select 1 from public.admin_users au
                      where au.id = (select auth.uid()) and au.role = 'owner'));

create policy "Owners can delete admin users" on public.admin_users
  for delete to authenticated
  using (exists (select 1 from public.admin_users au
                 where au.id = (select auth.uid()) and au.role = 'owner'));

-- 5) covering index for the job_applications → job_openings foreign key
create index if not exists idx_job_applications_opening_id
  on public.job_applications (opening_id);
