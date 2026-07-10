-- 20260709c_secure_document_grants
-- ─────────────────────────────────────────────────────────────────────
-- Rotating access links with a STABLE QR. The printed QR points at a fixed
-- landing URL (/d/<token>). Each scan mints a short-lived "grant" and the
-- phone is redirected to /d/<token>?s=<grant> — that rotating code is what
-- ends up in the address bar. So a link a worker copies & shares expires
-- after grant_ttl_seconds, while the wall QR keeps working (every scan
-- mints a fresh grant).
--
-- The grant is validated at sign-in; once a worker is in, they keep reading
-- (the bytes are already delivered) — expiry only blocks NEW sign-ins on a
-- stale shared link.
-- ─────────────────────────────────────────────────────────────────────

-- How long a minted link stays usable (per document).
alter table public.secure_documents
  add column if not exists grant_ttl_seconds int not null default 900
    check (grant_ttl_seconds between 60 and 86400);

-- Short-lived access grants.
create table if not exists public.secure_document_grants (
  atoken      text primary key,
  document_id uuid not null references public.secure_documents(id) on delete cascade,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);
alter table public.secure_document_grants enable row level security;  -- service-role only
create index if not exists secure_document_grants_doc_idx
  on public.secure_document_grants(document_id, expires_at desc);

-- Mint a grant for a landing token. Cleans up expired grants for the doc
-- as it goes so the table stays small. Service-role only.
create type public.secure_doc_grant_result as (
  status text,   -- ok | expired | revoked | disabled | not_found
  atoken text
);

create or replace function public.mint_document_grant(_landing_token text)
returns public.secure_doc_grant_result
language plpgsql
security definer
set search_path to 'pg_catalog', 'public'
as $$
declare
  _d      record;
  _atoken text;
begin
  select id, enabled, revoked, expires_at, grant_ttl_seconds
    into _d
    from public.secure_documents
   where token = _landing_token;
  if not found then
    return row('not_found', null)::public.secure_doc_grant_result;
  end if;
  if not _d.enabled then
    return row('disabled', null)::public.secure_doc_grant_result;
  end if;
  if _d.revoked then
    return row('revoked', null)::public.secure_doc_grant_result;
  end if;
  if _d.expires_at is not null and _d.expires_at < now() then
    return row('expired', null)::public.secure_doc_grant_result;
  end if;

  delete from public.secure_document_grants
   where document_id = _d.id and expires_at < now();

  _atoken := replace(gen_random_uuid()::text, '-', '')
          || replace(gen_random_uuid()::text, '-', '');
  insert into public.secure_document_grants(atoken, document_id, expires_at)
    values (_atoken, _d.id, now() + make_interval(secs => _d.grant_ttl_seconds));

  return row('ok', _atoken)::public.secure_doc_grant_result;
end;
$$;

revoke all on function public.mint_document_grant(text) from public;
revoke all on function public.mint_document_grant(text) from anon;
revoke all on function public.mint_document_grant(text) from authenticated;
grant execute on function public.mint_document_grant(text) to service_role;

-- Open a document via a GRANT (rotating link) instead of the raw token.
-- Validates the grant (exists + not expired) → resolves the document →
-- then the same name + passcode + rate-limit + log flow. Adds 'link_expired'.
create or replace function public.open_secure_document_grant(
  _grant    text,
  _passcode text,
  _name     text,
  _session  text,
  _ip       text default null,
  _ua       text default null
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

  insert into public.secure_document_views(document_id, viewer_name, ip, user_agent, session_id)
    values (_d.id, btrim(_name), _ip, _ua, _session);

  return row('ok', _d.storage_path, _d.content_type, _d.file_name, btrim(_name), null)
           ::public.secure_doc_open_result;
end;
$$;

revoke all on function public.open_secure_document_grant(text, text, text, text, text, text) from public;
revoke all on function public.open_secure_document_grant(text, text, text, text, text, text) from anon;
revoke all on function public.open_secure_document_grant(text, text, text, text, text, text) from authenticated;
grant execute on function public.open_secure_document_grant(text, text, text, text, text, text) to service_role;
