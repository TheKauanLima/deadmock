-- Canonical hero schema.
-- Seed data is populated separately by `node supabase/seed-heroes.mjs`.
drop table if exists hero_weapon_stats cascade;
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

-- Per-hero weapon stats used by the weapon editor and read-only stat views.
create table if not exists hero_weapon_stats (
  hero_id uuid primary key references heroes(id) on delete cascade,
  bullet_dps numeric(12,4),
  bullet_dps_boon_scaling numeric(12,4),
  bullet_dps_spirit_scaling numeric(12,4),
  bullet_dps_weapon_scaling numeric(12,4),
  weapon_name text not null,
  weapon_attributes text[] not null default '{}'::text[],
  weapon_image_path text,
  weapon_description text,
  weapon_min_falloff_range numeric(12,4),
  weapon_min_falloff_range_boon_scaling numeric(12,4),
  weapon_min_falloff_range_spirit_scaling numeric(12,4),
  weapon_min_falloff_range_weapon_scaling numeric(12,4),
  weapon_max_falloff_range numeric(12,4),
  weapon_max_falloff_range_boon_scaling numeric(12,4),
  weapon_max_falloff_range_spirit_scaling numeric(12,4),
  weapon_max_falloff_range_weapon_scaling numeric(12,4),
  bullet_damage numeric(12,4),
  bullet_damage_boon_scaling numeric(12,4),
  bullet_damage_spirit_scaling numeric(12,4),
  bullet_damage_weapon_scaling numeric(12,4),
  weapon_damage_percent numeric(12,4),
  weapon_damage_percent_boon_scaling numeric(12,4),
  weapon_damage_percent_spirit_scaling numeric(12,4),
  weapon_damage_percent_weapon_scaling numeric(12,4),
  bullets_per_sec numeric(12,4),
  bullets_per_sec_boon_scaling numeric(12,4),
  bullets_per_sec_spirit_scaling numeric(12,4),
  bullets_per_sec_weapon_scaling numeric(12,4),
  fire_rate_percent numeric(12,4),
  fire_rate_percent_boon_scaling numeric(12,4),
  fire_rate_percent_spirit_scaling numeric(12,4),
  fire_rate_percent_weapon_scaling numeric(12,4),
  ammo numeric(12,4),
  ammo_boon_scaling numeric(12,4),
  ammo_spirit_scaling numeric(12,4),
  ammo_weapon_scaling numeric(12,4),
  clip_size_increase_percent numeric(12,4),
  clip_size_increase_percent_boon_scaling numeric(12,4),
  clip_size_increase_percent_spirit_scaling numeric(12,4),
  clip_size_increase_percent_weapon_scaling numeric(12,4),
  reload_time numeric(12,4),
  reload_time_boon_scaling numeric(12,4),
  reload_time_spirit_scaling numeric(12,4),
  reload_time_weapon_scaling numeric(12,4),
  reload_reduction_percent numeric(12,4),
  reload_reduction_percent_boon_scaling numeric(12,4),
  reload_reduction_percent_spirit_scaling numeric(12,4),
  reload_reduction_percent_weapon_scaling numeric(12,4),
  bullet_velocity numeric(12,4),
  bullet_velocity_boon_scaling numeric(12,4),
  bullet_velocity_spirit_scaling numeric(12,4),
  bullet_velocity_weapon_scaling numeric(12,4),
  bullet_velocity_increase_percent numeric(12,4),
  bullet_velocity_increase_percent_boon_scaling numeric(12,4),
  bullet_velocity_increase_percent_spirit_scaling numeric(12,4),
  bullet_velocity_increase_percent_weapon_scaling numeric(12,4),
  bullet_lifesteal_percent numeric(12,4),
  bullet_lifesteal_percent_boon_scaling numeric(12,4),
  bullet_lifesteal_percent_spirit_scaling numeric(12,4),
  bullet_lifesteal_percent_weapon_scaling numeric(12,4),
  crit_bonus_scale_percent numeric(12,4),
  crit_bonus_scale_percent_boon_scaling numeric(12,4),
  crit_bonus_scale_percent_spirit_scaling numeric(12,4),
  crit_bonus_scale_percent_weapon_scaling numeric(12,4),
  light_melee_damage numeric(12,4),
  light_melee_damage_boon_scaling numeric(12,4),
  light_melee_damage_spirit_scaling numeric(12,4),
  light_melee_damage_weapon_scaling numeric(12,4),
  heavy_melee_damage numeric(12,4),
  heavy_melee_damage_boon_scaling numeric(12,4),
  heavy_melee_damage_spirit_scaling numeric(12,4),
  heavy_melee_damage_weapon_scaling numeric(12,4),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_hero_weapon_stats_hero_id on hero_weapon_stats(hero_id);

alter table heroes enable row level security;
alter table hero_catalog enable row level security;
alter table hero_cluster_themes enable row level security;
alter table hero_weapon_stats enable row level security;

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

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'hero_weapon_stats' and policyname = 'Public read hero weapon stats'
  ) then
    create policy "Public read hero weapon stats"
      on hero_weapon_stats
      for select
      using (true);
  end if;
end $$;

grant select on heroes to anon, authenticated;
grant select on hero_catalog to anon, authenticated;
grant select on hero_cluster_themes to anon, authenticated;
grant select on hero_weapon_stats to anon, authenticated;
