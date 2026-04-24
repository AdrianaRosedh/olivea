-- Migration: admin_users and admin_audit_log
-- Extends Supabase auth.users with app-specific admin profiles
-- ─────────────────────────────────────────────────────────────

-- Admin user profiles (linked to auth.users)
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  role text not null default 'editor'
    check (role in ('owner', 'manager', 'editor', 'host')),
  avatar_url text,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  section_permissions jsonb default '{}'::jsonb
);

-- RLS policies
alter table admin_users enable row level security;

-- Any authenticated user can read all admin profiles
create policy "Authenticated users can read admin profiles"
  on admin_users for select
  using (true);

-- Owners can manage (insert/update/delete) admin users via browser client
create policy "Owners can manage admin users"
  on admin_users for all
  using (
    exists (
      select 1 from admin_users au
      where au.id = auth.uid() and au.role = 'owner'
    )
  );

-- Service role bypasses RLS (used by server actions via PostgREST)
create policy "Service role full access"
  on admin_users for all
  using (true)
  with check (true);

-- Audit log for accountability
create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references admin_users(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb default '{}',
  ip_address inet,
  created_at timestamptz default now()
);

-- Index for querying audit logs by user and time
create index if not exists idx_audit_log_user_id on admin_audit_log(user_id);
create index if not exists idx_audit_log_created_at on admin_audit_log(created_at desc);
create index if not exists idx_audit_log_action on admin_audit_log(action);

-- RLS for audit log
alter table admin_audit_log enable row level security;

-- Only owners and managers can read audit logs
create policy "Owners and managers can read audit logs"
  on admin_audit_log for select
  using (
    exists (
      select 1 from admin_users
      where id = auth.uid() and role in ('owner', 'manager')
    )
  );

-- Any authenticated user can insert audit log entries (for their own actions)
create policy "Authenticated users can insert audit logs"
  on admin_audit_log for insert
  with check (auth.uid() is not null);
