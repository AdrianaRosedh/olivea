-- 20260709d_secure_document_views_forensics
-- ─────────────────────────────────────────────────────────────────────
-- Capture everything passively collectable on each sign-in (no permission
-- prompts — no GPS/camera). Purpose: make the access log forensically rich
-- so a fake name can be caught (e.g. the same device fingerprint signing in
-- under several different names).
--
-- Added:
--   · fp_hash        — durable device fingerprint hash (stable per device;
--                      survives cookie clearing). GROUP BY this to catch fakes.
--   · client jsonb   — full client payload (screen, timezone, languages, GPU,
--                      canvas hash, CPU/RAM, touch, connection, UA hints…).
--   · geo jsonb      — Vercel edge geo from the IP (country/region/city/lat/lng/tz).
--   · accept_language, referer — request headers.
--
-- Note: staff should be told access is logged (transparency / MX data-privacy).
-- ─────────────────────────────────────────────────────────────────────

alter table public.secure_document_views
  add column if not exists fp_hash         text,
  add column if not exists client          jsonb,
  add column if not exists geo             jsonb,
  add column if not exists accept_language text,
  add column if not exists referer         text;

-- Group sign-ins by device to spot one device using many names.
create index if not exists secure_document_views_fp_idx
  on public.secure_document_views(document_id, fp_hash);

-- Enrich the open RPC to persist all of the above. New params are optional
-- (defaults) so nothing else breaks.
create or replace function public.open_secure_document_grant(
  _grant           text,
  _passcode        text,
  _name            text,
  _session         text,
  _ip              text  default null,
  _ua              text  default null,
  _client          jsonb default null,
  _geo             jsonb default null,
  _fp_hash         text  default null,
  _accept_language text  default null,
  _referer         text  default null
)
returns public.secure_doc_open_result
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'extensions'
as $$
declare
  _g     record;
  _d     record;
  _fails int;
begin
  select g.document_id, g.expires_at into _g
    from public.secure_document_grants g
   where g.atoken = _grant;
  if not found or _g.expires_at < now() then
    return row('link_expired', null, null, null, null, null)::public.secure_doc_open_result;
  end if;

  select * into _d from public.secure_documents where id = _g.document_id;
  if not found then
    return row('not_found', null, null, null, null, null)::public.secure_doc_open_result;
  end if;
  if not _d.enabled then
    return row('disabled', null, null, null, null, null)::public.secure_doc_open_result;
  end if;
  if _d.revoked then
    return row('revoked', null, null, null, null, null)::public.secure_doc_open_result;
  end if;
  if _d.expires_at is not null and _d.expires_at < now() then
    return row('expired', null, null, null, null, null)::public.secure_doc_open_result;
  end if;

  select count(*) into _fails
    from public.secure_document_attempts
   where document_id = _d.id and attempted_at > now() - interval '1 hour';
  if _fails >= 20 then
    return row('rate_limited', null, null, null, null, 0)::public.secure_doc_open_result;
  end if;

  if _d.require_name and coalesce(btrim(_name), '') = '' then
    return row('name_required', null, null, null, null, null)::public.secure_doc_open_result;
  end if;

  if _d.passcode_hash is not null then
    if _passcode is null
       or extensions.crypt(_passcode, _d.passcode_hash) <> _d.passcode_hash then
      insert into public.secure_document_attempts(document_id, ip) values (_d.id, _ip);
      return row('bad_passcode', null, null, null, null, greatest(0, 20 - _fails - 1))
               ::public.secure_doc_open_result;
    end if;
  end if;

  insert into public.secure_document_views(
    document_id, viewer_name, ip, user_agent, session_id,
    fp_hash, client, geo, accept_language, referer
  )
  values (
    _d.id, btrim(_name), _ip, _ua, _session,
    _fp_hash, _client, _geo, _accept_language, _referer
  );

  return row('ok', _d.storage_path, _d.content_type, _d.file_name, btrim(_name), null)
           ::public.secure_doc_open_result;
end;
$$;

revoke all on function public.open_secure_document_grant(text, text, text, text, text, text, jsonb, jsonb, text, text, text) from public;
revoke all on function public.open_secure_document_grant(text, text, text, text, text, text, jsonb, jsonb, text, text, text) from anon;
revoke all on function public.open_secure_document_grant(text, text, text, text, text, text, jsonb, jsonb, text, text, text) from authenticated;
grant execute on function public.open_secure_document_grant(text, text, text, text, text, text, jsonb, jsonb, text, text, text) to service_role;
