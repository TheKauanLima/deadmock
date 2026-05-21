-- Canonical hero schema.
-- Seed data is populated separately by `node supabase/seed-heroes.mjs`.
-- drop table if exists hero_weapon_stats cascade;
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

create table if not exists hero_cluster_themes (
  hero_id uuid primary key references heroes(id) on delete cascade,
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

create index if not exists idx_hero_cluster_themes_hero_id on hero_cluster_themes(hero_id);

do $$
declare
  hero_id_attnum smallint;
  heroes_id_attnum smallint;
  fk_name text;
  has_correct_fk boolean;
begin
  select a.attnum
    into hero_id_attnum
  from pg_attribute a
  join pg_class t on t.oid = a.attrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public'
    and t.relname = 'hero_cluster_themes'
    and a.attname = 'hero_id'
    and not a.attisdropped;

  select a.attnum
    into heroes_id_attnum
  from pg_attribute a
  join pg_class t on t.oid = a.attrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public'
    and t.relname = 'heroes'
    and a.attname = 'id'
    and not a.attisdropped;

  select exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    join pg_class ft on ft.oid = c.confrelid
    where n.nspname = 'public'
      and t.relname = 'hero_cluster_themes'
      and ft.relname = 'heroes'
      and c.contype = 'f'
      and c.conkey = array[hero_id_attnum]::int2[]
      and c.confkey = array[heroes_id_attnum]::int2[]
  ) into has_correct_fk;

  if not has_correct_fk then
    for fk_name in
      select c.conname
      from pg_constraint c
      join pg_class t on t.oid = c.conrelid
      join pg_namespace n on n.oid = t.relnamespace
      where n.nspname = 'public'
        and t.relname = 'hero_cluster_themes'
        and c.contype = 'f'
        and c.conkey = array[hero_id_attnum]::int2[]
    loop
      execute format('alter table public.hero_cluster_themes drop constraint %I', fk_name);
    end loop;

    execute 'alter table public.hero_cluster_themes add constraint hero_cluster_themes_hero_id_fkey foreign key (hero_id) references public.heroes(id) on delete cascade';
  end if;
end $$;

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

-- Per-hero vitality stats
create table if not exists hero_vitality_stats (
  hero_id uuid primary key references heroes(id) on delete cascade,
  max_health numeric(12,4),
  max_health_boon_scaling numeric(12,4),
  max_health_spirit_scaling numeric(12,4),
  max_health_weapon_scaling numeric(12,4),
  health_regen numeric(12,4),
  health_regen_boon_scaling numeric(12,4),
  health_regen_spirit_scaling numeric(12,4),
  health_regen_weapon_scaling numeric(12,4),
  heal_amp_percent numeric(12,4),
  heal_amp_percent_boon_scaling numeric(12,4),
  heal_amp_percent_spirit_scaling numeric(12,4),
  heal_amp_percent_weapon_scaling numeric(12,4),
  non_combat_regen numeric(12,4),
  non_combat_regen_boon_scaling numeric(12,4),
  non_combat_regen_spirit_scaling numeric(12,4),
  non_combat_regen_weapon_scaling numeric(12,4),
  bullet_resist_percent numeric(12,4),
  bullet_resist_percent_boon_scaling numeric(12,4),
  bullet_resist_percent_spirit_scaling numeric(12,4),
  bullet_resist_percent_weapon_scaling numeric(12,4),
  spirit_resist_percent numeric(12,4),
  spirit_resist_percent_boon_scaling numeric(12,4),
  spirit_resist_percent_spirit_scaling numeric(12,4),
  spirit_resist_percent_weapon_scaling numeric(12,4),
  melee_resist_percent numeric(12,4),
  melee_resist_percent_boon_scaling numeric(12,4),
  melee_resist_percent_spirit_scaling numeric(12,4),
  melee_resist_percent_weapon_scaling numeric(12,4),
  debuff_resist_percent numeric(12,4),
  debuff_resist_percent_boon_scaling numeric(12,4),
  debuff_resist_percent_spirit_scaling numeric(12,4),
  debuff_resist_percent_weapon_scaling numeric(12,4),
  crit_reduction_percent numeric(12,4),
  crit_reduction_percent_boon_scaling numeric(12,4),
  crit_reduction_percent_spirit_scaling numeric(12,4),
  crit_reduction_percent_weapon_scaling numeric(12,4),
  move_speed numeric(12,4),
  move_speed_boon_scaling numeric(12,4),
  move_speed_spirit_scaling numeric(12,4),
  move_speed_weapon_scaling numeric(12,4),
  sprint_speed numeric(12,4),
  sprint_speed_boon_scaling numeric(12,4),
  sprint_speed_spirit_scaling numeric(12,4),
  sprint_speed_weapon_scaling numeric(12,4),
  stamina_cooldown numeric(12,4),
  stamina_cooldown_boon_scaling numeric(12,4),
  stamina_cooldown_spirit_scaling numeric(12,4),
  stamina_cooldown_weapon_scaling numeric(12,4),
  stamina_recovery_percent numeric(12,4),
  stamina_recovery_percent_boon_scaling numeric(12,4),
  stamina_recovery_percent_spirit_scaling numeric(12,4),
  stamina_recovery_percent_weapon_scaling numeric(12,4),
  stamina numeric(12,4),
  stamina_boon_scaling numeric(12,4),
  stamina_spirit_scaling numeric(12,4),
  stamina_weapon_scaling numeric(12,4),
  dash_speed numeric(12,4),
  dash_speed_boon_scaling numeric(12,4),
  dash_speed_spirit_scaling numeric(12,4),
  dash_speed_weapon_scaling numeric(12,4),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_hero_vitality_stats_hero_id on hero_vitality_stats(hero_id);

-- Per-hero spirit stats
create table if not exists hero_spirit_stats (
  hero_id uuid primary key references heroes(id) on delete cascade,
  ability_cooldown_percent numeric(12,4),
  ability_cooldown_percent_boon_scaling numeric(12,4),
  ability_cooldown_percent_spirit_scaling numeric(12,4),
  ability_cooldown_percent_weapon_scaling numeric(12,4),
  ability_duration_percent numeric(12,4),
  ability_duration_percent_boon_scaling numeric(12,4),
  ability_duration_percent_spirit_scaling numeric(12,4),
  ability_duration_percent_weapon_scaling numeric(12,4),
  ability_range_percent numeric(12,4),
  ability_range_percent_boon_scaling numeric(12,4),
  ability_range_percent_spirit_scaling numeric(12,4),
  ability_range_percent_weapon_scaling numeric(12,4),
  spirit_lifesteal_percent numeric(12,4),
  spirit_lifesteal_percent_boon_scaling numeric(12,4),
  spirit_lifesteal_percent_spirit_scaling numeric(12,4),
  spirit_lifesteal_percent_weapon_scaling numeric(12,4),
  max_charges_increase numeric(12,4),
  max_charges_increase_boon_scaling numeric(12,4),
  max_charges_increase_spirit_scaling numeric(12,4),
  max_charges_increase_weapon_scaling numeric(12,4),
  charge_cooldown_percent numeric(12,4),
  charge_cooldown_percent_boon_scaling numeric(12,4),
  charge_cooldown_percent_spirit_scaling numeric(12,4),
  charge_cooldown_percent_weapon_scaling numeric(12,4),
  spirit_power numeric(12,4),
  spirit_power_boon_scaling numeric(12,4),
  spirit_power_spirit_scaling numeric(12,4),
  spirit_power_weapon_scaling numeric(12,4),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_hero_spirit_stats_hero_id on hero_spirit_stats(hero_id);

-- Per-hero asset paths (backgrounds, hero name images, renders) + catalog metadata
create table if not exists hero_assets (
  hero_id uuid primary key references heroes(id) on delete cascade,
  display_label text not null,
  sort_order integer not null default 0,
  hero_portrait_path text not null,
  hero_render_path text not null,
  hero_name_path text,
  hero_bg_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_hero_assets_sort_order on hero_assets(sort_order, display_label);
create index if not exists idx_hero_assets_hero_id on hero_assets(hero_id);

alter table heroes enable row level security;
alter table hero_cluster_themes enable row level security;
alter table hero_weapon_stats enable row level security;
alter table hero_vitality_stats enable row level security;
alter table hero_spirit_stats enable row level security;
alter table hero_assets enable row level security;

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

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'hero_vitality_stats' and policyname = 'Public read hero vitality stats'
  ) then
    create policy "Public read hero vitality stats"
      on hero_vitality_stats
      for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'hero_spirit_stats' and policyname = 'Public read hero spirit stats'
  ) then
    create policy "Public read hero spirit stats"
      on hero_spirit_stats
      for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'hero_assets' and policyname = 'Public read hero assets'
  ) then
    create policy "Public read hero assets"
      on hero_assets
      for select
      using (true);
  end if;
end $$;

grant select on heroes to anon, authenticated;
grant select on hero_cluster_themes to anon, authenticated;
grant select on hero_weapon_stats to anon, authenticated;
grant select on hero_vitality_stats to anon, authenticated;
grant select on hero_spirit_stats to anon, authenticated;
grant select on hero_assets to anon, authenticated;
