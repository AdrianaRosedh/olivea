-- Public can no longer read popups and banners before their start time.
--
-- The public-read policies only checked `enabled`, so anyone with the public
-- anon key could query the REST API and see an announcement (e.g. a guest-chef
-- dinner) that was switched on but scheduled for later. The site itself
-- already filtered by schedule; this closes the direct-API path.
-- Events are deliberately unchanged: an event is promoted before its date.
--
-- Popups keep their schedule as ISO text in rules->>'startsAt'; a malformed
-- value must not break every popup read, so it is parsed defensively (a bad or
-- empty value counts as "no start time").

create or replace function public.try_timestamptz(_v text)
returns timestamptz
language plpgsql
stable
set search_path to 'pg_catalog'
as $$
begin
  if _v is null or btrim(_v) = '' then return null; end if;
  return _v::timestamptz;
exception when others then
  return null;
end;
$$;

grant execute on function public.try_timestamptz(text) to anon, authenticated, service_role;

drop policy if exists "Public can read enabled popups" on public.popups;
create policy "Public can read enabled popups" on public.popups
  for select to public
  using (
    enabled = true
    and coalesce(public.try_timestamptz(rules->>'startsAt') <= now(), true)
  );

drop policy if exists "Public can read enabled banners" on public.banners;
create policy "Public can read enabled banners" on public.banners
  for select to public
  using (
    enabled = true
    and (starts_at is null or starts_at <= now())
  );
