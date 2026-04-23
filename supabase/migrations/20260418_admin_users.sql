-- Migration: admin_users and admin_audit_log
-- Extends Supabase auth.users with app-specific admin profiles
-- ─────────────────────────────────────────────────────────────

-- Admin user profiles (linked to auth.users)
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'editor'
    check (role in ('owner', 'manager', 'editor', 'host')),
  avatar_url text,
  invited_by uuid references admin_users(id),
  last_active_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at on row change
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger admin_users_updated_at
  before update on admin_users
  for each row execute function update_updated_at_column();

-- RLS policies
alter table admin_users enable row level security;

-- Any authenticated user can read all admin profiles
create policy "Authenticated users can read profiles"
  on admin_users for select
  using (auth.uid() is not null);

-- Users can update their own profile (name, avatar only)
create policy "Users can update own profile"
  on admin_users for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from admin_users where id = auth.uid())
  );

-- Owners can insert new admin users
create policy "Owners can insert users"
  on admin_users for insert
  with check (
    exists (
      select 1 from admin_users
      where id = auth.uid() and role = 'owner'
    )
  );

-- Owners can delete admin users
create policy "Owners can delete users"
  on admin_users for delete
  using (
    exists (
      select 1 from admin_users
      where id = auth.uid() and role = 'owner'
    )
  );

-- Owners can update any user (for role changes)
create policy "Owners can update any user"
  on admin_users for update
  using (
    exists (
      select 1 from admin_users
      where id = auth.uid() and role = 'owner'
    )
  );

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
