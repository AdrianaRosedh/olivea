-- 20260710_secure_documents_admin_create
-- ─────────────────────────────────────────────────────────────────────
-- Admin authoring RPCs for secure documents. Service-role only. Token is
-- minted server-side (128-bit, hex) and the passcode is bcrypt-hashed in the
-- DB (pgcrypto), so a plaintext passcode never lands in a column. The file
-- must already be uploaded to the private secure-documents bucket at
-- _storage_path by the calling server action (service role).
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.admin_create_secure_document(
  _storage_path        text,
  _file_name           text        default null,
  _content_type        text        default 'application/pdf',
  _recipient           text        default null,
  _passcode            text        default null,
  _require_name        boolean     default true,
  _access_mode         text        default 'multi_viewer',
  _expires_at          timestamptz default null,
  _read_window_seconds int         default 900,
  _grant_ttl_seconds   int         default 900
)
returns table(id uuid, token text)
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'extensions'
as $$
declare
  _token text := encode(gen_random_bytes(16), 'hex');
  _hash  text;
begin
  if _passcode is not null and btrim(_passcode) <> '' then
    _hash := crypt(_passcode, gen_salt('bf'));
  end if;
  return query
  insert into public.secure_documents(
    token, storage_path, file_name, content_type, recipient,
    passcode_hash, require_name, access_mode, expires_at,
    read_window_seconds, grant_ttl_seconds
  )
  values (
    _token, _storage_path, _file_name,
    coalesce(_content_type, 'application/pdf'), _recipient,
    _hash, coalesce(_require_name, true),
    coalesce(_access_mode, 'multi_viewer'), _expires_at,
    greatest(30, least(86400, coalesce(_read_window_seconds, 900))),
    greatest(60, least(86400, coalesce(_grant_ttl_seconds, 900)))
  )
  returning secure_documents.id, secure_documents.token;
end;
$$;

-- Set or clear a document's passcode (bcrypt). NULL/'' clears it.
create or replace function public.admin_set_document_passcode(_id uuid, _passcode text)
returns void
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'extensions'
as $$
begin
  update public.secure_documents
     set passcode_hash = case
           when _passcode is null or btrim(_passcode) = '' then null
           else crypt(_passcode, gen_salt('bf'))
         end
   where id = _id;
end;
$$;

revoke all on function public.admin_create_secure_document(text,text,text,text,text,boolean,text,timestamptz,int,int) from public;
revoke all on function public.admin_create_secure_document(text,text,text,text,text,boolean,text,timestamptz,int,int) from anon;
revoke all on function public.admin_create_secure_document(text,text,text,text,text,boolean,text,timestamptz,int,int) from authenticated;
grant execute on function public.admin_create_secure_document(text,text,text,text,text,boolean,text,timestamptz,int,int) to service_role;

revoke all on function public.admin_set_document_passcode(uuid, text) from public;
revoke all on function public.admin_set_document_passcode(uuid, text) from anon;
revoke all on function public.admin_set_document_passcode(uuid, text) from authenticated;
grant execute on function public.admin_set_document_passcode(uuid, text) to service_role;
