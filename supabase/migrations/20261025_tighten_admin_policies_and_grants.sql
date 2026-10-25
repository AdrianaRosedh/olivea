-- 20261025_tighten_admin_policies_and_grants.sql
--
-- NOT YET APPLIED. Prepared from the 2026-10-25 security review; run only with
-- the owner's yes (live database). Written against the LIVE policy names,
-- checked with pg_policies on 2026-10-25.
--
-- Why each change is safe for the app: every write and every admin read in the
-- app goes through the service role (lib/supabase/client.ts, lib/auth/*), which
-- bypasses RLS and is not affected by grants revoked from anon/authenticated.
-- The anon key is used only to SELECT published content; nothing in the browser
-- writes to the database.

begin;

-- 1. Audit log: any signed-in account could insert entries credited to anyone
--    (the only check was auth.uid() IS NOT NULL). The app writes the log with
--    the service role, so the policy is not needed.
drop policy if exists "Authenticated users can insert audit logs" on public.admin_audit_log;

-- 2. Admin profiles: any signed-in account could read every admin's email,
--    role and section permissions (USING true). Each person now reads only
--    their own row. The owner-only insert/update/delete policies keep working:
--    their subquery finds the owner's own row under this policy.
drop policy if exists "Authenticated users can read admin profiles" on public.admin_users;
create policy "Admins read their own profile"
  on public.admin_users
  for select
  to authenticated
  using (id = (select auth.uid()));

-- 3. Defence in depth: the public roles keep Supabase's default write grants on
--    every table, so RLS is the only thing stopping a write, and TRUNCATE is
--    not covered by RLS at all. They only ever need SELECT.
revoke insert, update, delete, truncate, trigger, references
  on all tables in schema public from anon, authenticated;
alter default privileges in schema public
  revoke insert, update, delete, truncate, trigger, references on tables from anon, authenticated;

-- Private tables the public roles never read at all (RLS already denies them;
-- this removes the grant too).
revoke all on public.job_applications,
              public.secure_documents,
              public.secure_document_views,
              public.secure_document_attempts,
              public.secure_document_grants,
              public.rate_limit_counters,
              public.admin_audit_log
  from anon, authenticated;

commit;

-- Not SQL (dashboard): Auth → Password security → enable leaked-password
-- protection, since admins can sign in with a password.
