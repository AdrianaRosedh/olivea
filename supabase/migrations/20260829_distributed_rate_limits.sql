-- Atomic cross-instance request limiting for serverless/edge handlers.
-- Only service_role can execute the RPC; callers store HMAC digests rather
-- than raw IP addresses or email addresses.

create table if not exists public.rate_limit_buckets (
  key_hash text primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 0)
);

alter table public.rate_limit_buckets enable row level security;
revoke all on table public.rate_limit_buckets from public, anon, authenticated;
grant all on table public.rate_limit_buckets to service_role;

create index if not exists idx_rate_limit_buckets_window_started_at
  on public.rate_limit_buckets (window_started_at);

create or replace function public.check_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window interval := make_interval(secs => greatest(1, least(p_window_seconds, 86400)));
  v_limit integer := greatest(1, least(p_limit, 10000));
  v_bucket public.rate_limit_buckets%rowtype;
  v_retry_after integer;
begin
  if p_key_hash is null or p_key_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid rate-limit key';
  end if;

  insert into public.rate_limit_buckets as bucket (
    key_hash, window_started_at, request_count
  ) values (
    p_key_hash, v_now, 1
  )
  on conflict (key_hash) do update set
    window_started_at = case
      when bucket.window_started_at + v_window <= v_now then v_now
      else bucket.window_started_at
    end,
    request_count = case
      when bucket.window_started_at + v_window <= v_now then 1
      else bucket.request_count + 1
    end
  returning * into v_bucket;

  v_retry_after := greatest(
    0,
    ceil(extract(epoch from (v_bucket.window_started_at + v_window - v_now)))::integer
  );

  -- Amortized cleanup prevents abandoned keys from growing the table forever.
  if random() < 0.01 then
    delete from public.rate_limit_buckets
      where window_started_at < v_now - interval '24 hours';
  end if;

  return jsonb_build_object(
    'ok', v_bucket.request_count <= v_limit,
    'remaining', greatest(0, v_limit - v_bucket.request_count),
    'retry_after', v_retry_after
  );
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer) from public;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
