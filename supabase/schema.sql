-- Canonical hero schema.
-- Seed data is populated separately by `node supabase/seed-heroes.mjs`.
drop table if exists hero_cluster_themes cascade;
drop table if exists hero_catalog cascade;
drop table if exists heroes cascade;
create extension if not exists pgcrypto;

create table if not exists heroes (
  id uuid primary key,
  name text not null,
  owner_id uuid,
  visibility text default 'public',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_heroes_owner on heroes(owner_id);
create index if not exists idx_heroes_name on heroes(name);

-- Canonical hero catalog for fixed Deadlock heroes used by the UI.
create table if not exists hero_catalog (
  hero_id uuid primary key references heroes(id) on delete cascade,
  display_label text not null,
  portrait_path text not null,
  render_path text not null,
  signature_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Per-hero theme data used by the background hero cluster.
create table if not exists hero_cluster_themes (
  hero_id uuid primary key references hero_catalog(hero_id) on delete cascade,
  hero_folder text not null,
  signature_color text not null default '#ffefd6',
  rectangle_color text not null default '#cccccc',
  text_labels text[] not null default array['TBD', 'TBD', 'TBD']::text[],
  text_color text not null default '#111111',
  ability_color text not null default '#111111',
  circle_color text not null default '#cccccc',
  ability_icons text[] not null default '{}'::text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_hero_catalog_sort_order on hero_catalog(sort_order, display_label);
create index if not exists idx_hero_cluster_themes_hero_id on hero_cluster_themes(hero_id);

alter table heroes enable row level security;
alter table hero_catalog enable row level security;
alter table hero_cluster_themes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'heroes' and policyname = 'Public read heroes'
  ) then
    create policy "Public read heroes"
      on heroes
      for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'hero_catalog' and policyname = 'Public read hero catalog'
  ) then
    create policy "Public read hero catalog"
      on hero_catalog
      for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'hero_cluster_themes' and policyname = 'Public read hero cluster themes'
  ) then
    create policy "Public read hero cluster themes"
      on hero_cluster_themes
      for select
      using (true);
  end if;
end $$;

grant select on heroes to anon, authenticated;
grant select on hero_catalog to anon, authenticated;
grant select on hero_cluster_themes to anon, authenticated;
