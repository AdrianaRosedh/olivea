-- Secure documents: count failed passcode attempts per visitor, not per
-- document.
--
-- Before: 20 failures in an hour from ANYONE locked the document for
-- EVERYONE, so a single person holding the wall-QR link could lock staff out
-- indefinitely. Now:
--   * each visitor (by IP) gets 10 failures an hour;
--   * a document-wide ceiling of 200 an hour stays as a backstop against
--     slow distributed guessing;
--   * the count and the insert run under a per-document transaction lock, so
--     a parallel burst can't slip past either limit.
-- Return shape and statuses are unchanged.

create or replace function public.open_secure_document_grant(
  _grant text, _passcode text, _name text, _session text,
  _ip text default null, _ua text default null, _client jsonb default null,
  _geo jsonb default null, _fp_hash text default null,
  _accept_language text default null, _referer text default null
)
returns public.secure_doc_open_result
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'extensions'
as $function$
declare
  _g            record;
  _d            record;
  _visitor_fail int;
  _doc_fail     int;
  _visitor_max  constant int := 10;
  _doc_max      constant int := 200;
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

  -- Serialise attempts on this document so the counts below are exact.
  perform pg_advisory_xact_lock(hashtextextended(_d.id::text, 0));

  select count(*) filter (where coalesce(ip, '') = coalesce(_ip, '')),
         count(*)
    into _visitor_fail, _doc_fail
    from public.secure_document_attempts
   where document_id = _d.id and attempted_at > now() - interval '1 hour';
  if _visitor_fail >= _visitor_max or _doc_fail >= _doc_max then
    return row('rate_limited', null, null, null, null, 0)::public.secure_doc_open_result;
  end if;

  if _d.require_name and coalesce(btrim(_name), '') = '' then
    return row('name_required', null, null, null, null, null)::public.secure_doc_open_result;
  end if;

  if _d.passcode_hash is not null then
    if _passcode is null
       or extensions.crypt(_passcode, _d.passcode_hash) <> _d.passcode_hash then
      insert into public.secure_document_attempts(document_id, ip) values (_d.id, _ip);
      return row('bad_passcode', null, null, null, null, greatest(0, _visitor_max - _visitor_fail - 1))
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
$function$;

-- Execution stays service-role only (CREATE OR REPLACE keeps existing grants;
-- re-stated so the file is self-contained).
revoke all on function public.open_secure_document_grant(text, text, text, text, text, text, jsonb, jsonb, text, text, text) from public, anon, authenticated;
grant execute on function public.open_secure_document_grant(text, text, text, text, text, text, jsonb, jsonb, text, text, text) to service_role;
