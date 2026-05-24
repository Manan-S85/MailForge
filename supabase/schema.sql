-- Email Template Management Platform (Supabase / Postgres)
-- Apply this in Supabase SQL Editor (or via migrations).

-- Extensions
create extension if not exists pgcrypto;

-- Utility: updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists categories_owner_name_unique
  on public.categories (owner_id, lower(name));

alter table public.categories enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'categories'
  ) then
    create policy "categories_select_own" on public.categories
      for select using (owner_id = auth.uid());

    create policy "categories_insert_own" on public.categories
      for insert with check (owner_id = auth.uid());

    create policy "categories_update_own" on public.categories
      for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

    create policy "categories_delete_own" on public.categories
      for delete using (owner_id = auth.uid());
  end if;
end;
$$;

-- Placeholders
create table if not exists public.placeholders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  description text,
  sample_value text,
  created_at timestamptz not null default now()
);

create unique index if not exists placeholders_owner_key_unique
  on public.placeholders (owner_id, lower(key));

alter table public.placeholders enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'placeholders'
  ) then
    create policy "placeholders_select_own" on public.placeholders
      for select using (owner_id = auth.uid());

    create policy "placeholders_insert_own" on public.placeholders
      for insert with check (owner_id = auth.uid());

    create policy "placeholders_update_own" on public.placeholders
      for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

    create policy "placeholders_delete_own" on public.placeholders
      for delete using (owner_id = auth.uid());
  end if;
end;
$$;

-- Templates
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,

  name text not null,
  subject text not null default '',

  -- Tiptap JSON and rendered HTML stored separately for flexibility.
  body_json jsonb,
  body_html text not null default '',

  placeholders text[] not null default '{}',

  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists templates_owner_updated_idx
  on public.templates (owner_id, updated_at desc);

create index if not exists templates_owner_category_idx
  on public.templates (owner_id, category_id);

create trigger templates_set_updated_at
  before update on public.templates
  for each row execute function public.set_updated_at();

alter table public.templates enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'templates'
  ) then
    create policy "templates_select_own" on public.templates
      for select using (owner_id = auth.uid());

    create policy "templates_insert_own" on public.templates
      for insert with check (owner_id = auth.uid());

    create policy "templates_update_own" on public.templates
      for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

    create policy "templates_delete_own" on public.templates
      for delete using (owner_id = auth.uid());
  end if;
end;
$$;

-- Email send logs
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references public.templates(id) on delete set null,

  recipient_email text not null,
  subject text not null,
  provider text not null default 'resend',
  provider_message_id text,
  status text not null check (status in ('sent', 'failed')),
  error text,

  created_at timestamptz not null default now()
);

create index if not exists email_logs_owner_created_idx
  on public.email_logs (owner_id, created_at desc);

create index if not exists email_logs_owner_template_created_idx
  on public.email_logs (owner_id, template_id, created_at desc);

alter table public.email_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'email_logs'
  ) then
    create policy "email_logs_select_own" on public.email_logs
      for select using (owner_id = auth.uid());

    create policy "email_logs_insert_own" on public.email_logs
      for insert with check (owner_id = auth.uid());

    create policy "email_logs_delete_own" on public.email_logs
      for delete using (owner_id = auth.uid());
  end if;
end;
$$;

-- AI logs
create table if not exists public.ai_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references public.templates(id) on delete set null,

  action text not null,
  model text,
  input jsonb,
  output jsonb,
  tokens_in integer,
  tokens_out integer,

  created_at timestamptz not null default now()
);

create index if not exists ai_logs_owner_created_idx
  on public.ai_logs (owner_id, created_at desc);

alter table public.ai_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_logs'
  ) then
    create policy "ai_logs_select_own" on public.ai_logs
      for select using (owner_id = auth.uid());

    create policy "ai_logs_insert_own" on public.ai_logs
      for insert with check (owner_id = auth.uid());

    create policy "ai_logs_delete_own" on public.ai_logs
      for delete using (owner_id = auth.uid());
  end if;
end;
$$;

-- Simple rate limiting counter (per user + action + time window)
create table if not exists public.rate_limit_counters (
  key text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (key, window_start)
);

create or replace function public.rate_limit_increment(
  p_key text,
  p_window_start timestamptz,
  p_increment integer default 1
)
returns integer
language plpgsql
as $$
declare
  v_count integer;
begin
  insert into public.rate_limit_counters(key, window_start, count, updated_at)
  values (p_key, p_window_start, p_increment, now())
  on conflict (key, window_start)
  do update set count = public.rate_limit_counters.count + excluded.count, updated_at = now()
  returning count into v_count;

  return v_count;
end;
$$;
