-- Supabase schema for `heroes` table
create extension if not exists pgcrypto;

create table if not exists heroes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid,
  visibility text default 'public',
  base_stats jsonb not null default '{}'::jsonb,
  computed_hp numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_heroes_owner on heroes(owner_id);

-- index to speed queries by hp stored inside jsonb (optional)
create index if not exists idx_heroes_hp on heroes(((base_stats ->> 'hp')));
