-- 20260709_secure_documents
-- ─────────────────────────────────────────────────────────────────────
-- One-session, watermarked "secure document" links for Olivea. A QR points
-- to /d/<token>; the first browser session to open it claims the document
-- for a short read window and it's dead to every other device. The file
-- lives in a PRIVATE bucket and is streamed only through a service-role
-- server action — the raw URL never reaches the browser.
--
-- Honest scope: a browser cannot block screenshots. The protections are
-- (1) unguessable + expiring link, (2) single-use view, (3) an in-pixel
-- watermark so a leaked screenshot is traceable.
--
-- Self-contained (no dependency on any other table); schema `public`, to
-- match the rest of the Olivea database.
-- ─────────────────────────────────────────────────────────────────────

-- Private bucket. No public flag, no anon RLS policies on storage.objects
-- → sealed; only the service role reads it.
insert into storage.buckets (id, name, public)
values ('secure-documents', 'secure-documents', false)
on conflict (id) do nothing;

create table if not exists public.secure_documents (
  id                   uuid primary key default gen_random_uuid(),
  token                text not null unique,     -- unguessable, in the URL
  storage_path         text not null,            -- path within secure-documents
  file_name            text,                     -- original name (aria/label only)
  content_type         text not null default 'application/pdf',
  recipient            text,                     -- watermark line (e.g. "OLIVEA")
  read_window_seconds  int  not null default 900
                         check (read_window_seconds between 30 and 86400),
  expires_at           timestamptz,              -- hard cap even if never opened
  enabled              boolean not null default true,
  revoked              boolean not null default false,  -- manual kill switch
  -- one-session claim state
  claimed_session_hash text,
  claimed_at           timestamptz,
  view_count           int  not null default 0,
  created_at           timestamptz not null default now()
);

-- Sealed: reachable only via the SECURITY DEFINER RPC below + the service
-- role. anon / authenticated get nothing directly (RLS on, no policies).
alter table public.secure_documents enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'secure_doc_claim_result' and n.nspname = 'public'
  ) then
    create type public.secure_doc_claim_result as (
      status       text,   -- ok | consumed | expired | revoked | disabled | not_found
      storage_path text,
      content_type text,
      file_name    text,
      recipient    text
    );
  end if;
end $$;

-- First session to claim wins + starts the read window. After that only the
-- same session, still inside the window, may re-read; everyone else gets
-- 'consumed'. Row locked FOR UPDATE so two first-claims can't both win.
create or replace function public.claim_secure_document(
  _token        text,
  _session_hash text
)
returns public.secure_doc_claim_result
language plpgsql
security definer
set search_path to 'pg_catalog', 'public'
as $$
declare
  _d       record;
  _win_end timestamptz;
begin
  select * into _d from public.secure_documents where token = _token for update;
  if not found then
    return row('not_found', null, null, null, null)::public.secure_doc_claim_result;
  end if;
  if not _d.enabled then
    return row('disabled', null, null, null, null)::public.secure_doc_claim_result;
  end if;
  if _d.revoked then
    return row('revoked', null, null, null, null)::public.secure_doc_claim_result;
  end if;
  if _d.expires_at is not null and _d.expires_at < now() then
    return row('expired', null, null, null, null)::public.secure_doc_claim_result;
  end if;

  if _d.claimed_session_hash is null then
    update public.secure_documents
       set claimed_session_hash = _session_hash, claimed_at = now(), view_count = 1
     where id = _d.id;
    return row('ok', _d.storage_path, _d.content_type, _d.file_name, _d.recipient)
             ::public.secure_doc_claim_result;
  end if;

  _win_end := _d.claimed_at + make_interval(secs => _d.read_window_seconds);
  if _d.claimed_session_hash = _session_hash and now() <= _win_end then
    update public.secure_documents set view_count = view_count + 1 where id = _d.id;
    return row('ok', _d.storage_path, _d.content_type, _d.file_name, _d.recipient)
             ::public.secure_doc_claim_result;
  end if;

  return row('consumed', null, null, null, null)::public.secure_doc_claim_result;
end;
$$;

revoke all on function public.claim_secure_document(text, text) from public;
revoke all on function public.claim_secure_document(text, text) from anon;
revoke all on function public.claim_secure_document(text, text) from authenticated;
grant execute on function public.claim_secure_document(text, text) to service_role;
