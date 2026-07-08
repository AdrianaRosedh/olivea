-- ─────────────────────────────────────────────────────────────────────
-- Admin portal per-user language preference.
--
-- Each team member picks their own admin-panel language (Mexican Spanish
-- by default, or English) from the profile panel. The layout reads this
-- column and passes it to the AdminLocaleProvider as initialLocale; every
-- admin string resolves through t({ es, en }) against it.
--
-- Public-site content is unaffected — this only controls the language of
-- the admin chrome, and only for the user who set it.
-- ─────────────────────────────────────────────────────────────────────

alter table public.admin_users
  add column if not exists locale text not null default 'es'
  check (locale in ('es', 'en'));

comment on column public.admin_users.locale is
  'Admin-panel UI language for this user: es (Mexican Spanish, default) or en.';
