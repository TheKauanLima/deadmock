const STAT_DEFINITIONS = [
  {
    label: 'Bullet Damage',
    valueField: 'bullet_damage',
    fallback: 0,
    unit: '',
    icon: 'bullet_damage',
    scalingBase: 'bullet_damage',
  },
  {
    label: 'Weapon Damage',
    valueField: 'weapon_damage_percent',
    fallback: 0,
    unit: '%',
    icon: 'bullet_damage',
    scalingBase: 'weapon_damage_percent',
  },
  {
    label: 'Bullets per sec',
    valueField: 'bullets_per_sec',
    fallback: 0,
    unit: '',
    icon: 'fire_rate',
    scalingBase: 'bullets_per_sec',
  },
  {
    label: 'Fire Rate',
    valueField: 'fire_rate_percent',
    fallback: 0,
    unit: '%',
    icon: 'fire_rate',
    scalingBase: 'fire_rate_percent',
  },
  {
    label: 'Ammo',
    valueField: 'ammo',
    fallback: 0,
    unit: '',
    icon: 'ammo_clip_size',
    scalingBase: 'ammo',
  },
  {
    label: 'Clip Size Increase',
    valueField: 'clip_size_increase_percent',
    fallback: 0,
    unit: '%',
    icon: 'ammo_clip_size',
    scalingBase: 'clip_size_increase_percent',
  },
  {
    label: 'Reload Time',
    valueField: 'reload_time',
    fallback: 0,
    unit: 's',
    icon: 'ammo_reload',
    scalingBase: 'reload_time',
  },
  {
    label: 'Reload Reduction',
    valueField: 'reload_reduction_percent',
    fallback: 0,
    unit: '%',
    icon: 'ammo_reload_reduction',
    scalingBase: 'reload_reduction_percent',
  },
  {
    label: 'Bullet Velocity',
    valueField: 'bullet_velocity',
    fallback: 0,
    unit: 'm/s',
    icon: 'bullet_velocity',
    scalingBase: 'bullet_velocity',
  },
  {
    label: 'Bullet Velocity Increase',
    valueField: 'bullet_velocity_increase_percent',
    fallback: 0,
    unit: '%',
    icon: 'bullet_velocity',
    scalingBase: 'bullet_velocity_increase_percent',
  },
  {
    label: 'Bullet Lifesteal',
    valueField: 'bullet_lifesteal_percent',
    fallback: 0,
    unit: '%',
    icon: 'health_steal_bullets',
    scalingBase: 'bullet_lifesteal_percent',
  },
  {
    label: 'Crit Bonus Scale',
    valueField: 'crit_bonus_scale_percent',
    fallback: 0,
    unit: '%',
    icon: 'crit_bonus_scale',
    scalingBase: 'crit_bonus_scale_percent',
  },
  {
    label: 'Light Melee',
    valueField: 'light_melee_damage',
    fallback: 50,
    unit: '',
    icon: 'melee',
    scalingBase: 'light_melee_damage',
  },
  {
    label: 'Heavy Melee',
    valueField: 'heavy_melee_damage',
    fallback: 116,
    unit: '',
    icon: 'melee',
    scalingBase: 'heavy_melee_damage',
  },
];

function parseScalingValue(value) {
  if (value == null) return null;
  const parsed = Number(String(value).trim());
  if (Number.isNaN(parsed) || parsed === 0) return null;
  return parsed;
}

function mapScaling(row, base) {
  const spirit = parseScalingValue(row[`${base}_spirit_scaling`]);
  const weapon = parseScalingValue(row[`${base}_weapon_scaling`]);
  const boon = parseScalingValue(row[`${base}_boon_scaling`]);

  if (spirit !== null) return {scaling: 'spirit', scalingValue: String(spirit)};
  if (weapon !== null) return {scaling: 'courage', scalingValue: String(weapon)};
  if (boon !== null) return {scaling: 'boon', scalingValue: String(boon)};
  return {scaling: 'none', scalingValue: '0'};
}

export function buildWeaponStatsArray(row) {
  return STAT_DEFINITIONS.map((definition) => ({
    label: definition.label,
    value: String(row[definition.valueField] ?? definition.fallback),
    unit: definition.unit,
    icon: definition.icon,
    ...mapScaling(row, definition.scalingBase),
  }));
}
