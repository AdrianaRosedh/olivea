-- 20260709b_secure_documents_signin
-- ─────────────────────────────────────────────────────────────────────
-- Turns secure documents into a POSTED, access-controlled sign-in surface
-- (for a wall-mounted QR to a Reglamento Interior de Trabajo, which law
-- requires be posted for workers). Model change from single-use:
--
--   Worker scans the wall QR → enters NAME + shared PASSCODE → reads the
--   doc, watermarked with their name + open time → the view is LOGGED.
--
-- So instead of "first session claims it", access is gated by a shared
-- passcode + a required name, many people may view, and every view is
-- recorded for compliance. Passcode is bcrypt-hashed; attempts are
-- rate-limited to blunt brute force.
-- ─────────────────────────────────────────────────────────────────────

-- 1. Extend the document row.
alter table public.secure_documents
  add column if not exists passcode_hash text,
  add column if not exists require_name boolean not null default true,
  add column if not exists access_mode text not null default 'multi_viewer'
    check (access_mode in ('single_session', 'multi_viewer'));

-- 2. Access log — proof of who opened the regulation, and when.
create table if not exists public.secure_document_views (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.secure_documents(id) on delete cascade,
  viewer_name text not null,
  viewed_at   timestamptz not null default now(),
  ip          text,
  user_agent  text,
  session_id  text
);
alter table public.secure_document_views enable row level security;
create index if not exists secure_document_views_doc_idx
  on public.secure_document_views(document_id, viewed_at desc);

-- 3. Passcode attempts — for rate limiting.
create table if not exists public.secure_document_attempts (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.secure_documents(id) on delete cascade,
  ip           text,
  attempted_at timestamptz not null default now()
);
alter table public.secure_document_attempts enable row level security;
create index if not exists secure_document_attempts_doc_idx
  on public.secure_document_attempts(document_id, attempted_at desc);

-- 4. Result shape.
do $$
begin
  if not exists (
    select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'secure_doc_open_result' and n.nspname = 'public'
  ) then
    create type public.secure_doc_open_result as (
      status             text,  -- ok | bad_passcode | rate_limited | name_required | expired | revoked | disabled | not_found
      storage_path       text,
      content_type       text,
      file_name          text,
      viewer_name        text,
      remaining_attempts int
    );
  end if;
end $$;

-- 5. Verify passcode + require name + LOG the view + return the file pointer.
--    Service-role only. Rate-limited (20 wrong tries / hour / document).
create or replace function public.open_secure_document(
  _token    text,
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
  _d     record;
  _fails int;
begin
  select * into _d from public.secure_documents where token = _token;
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

  -- Success → record the view (compliance log).
  insert into public.secure_document_views(document_id, viewer_name, ip, user_agent, session_id)
    values (_d.id, btrim(_name), _ip, _ua, _session);

  return row('ok', _d.storage_path, _d.content_type, _d.file_name, btrim(_name), null)
           ::public.secure_doc_open_result;
end;
$$;

revoke all on function public.open_secure_document(text, text, text, text, text, text) from public;
revoke all on function public.open_secure_document(text, text, text, text, text, text) from anon;
revoke all on function public.open_secure_document(text, text, text, text, text, text) from authenticated;
grant execute on function public.open_secure_document(text, text, text, text, text, text) to service_role;
