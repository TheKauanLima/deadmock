const STAT_DEFINITIONS = [
  {
    label: 'Max Health',
    valueField: 'max_health',
    fallback: 810,
    unit: '',
    icon: 'max_health',
    scalingBase: 'max_health',
  },
  {
    label: 'Health Regen',
    valueField: 'health_regen',
    fallback: 1.5,
    unit: '',
    icon: 'health_regen',
    scalingBase: 'health_regen',
  },
  {
    label: 'Heal Amp',
    valueField: 'heal_amp_percent',
    fallback: 0,
    unit: '%',
    icon: 'heal_amp',
    scalingBase: 'heal_amp_percent',
  },
  {
    label: 'Non-Combat Regen',
    valueField: 'non_combat_regen',
    fallback: 0,
    unit: '',
    icon: 'health_regen',
    scalingBase: 'non_combat_regen',
  },
  {
    label: 'Bullet Resist',
    valueField: 'bullet_resist_percent',
    fallback: 0,
    unit: '%',
    icon: 'bullet_resist',
    scalingBase: 'bullet_resist_percent',
  },
  {
    label: 'Spirit Resist',
    valueField: 'spirit_resist_percent',
    fallback: 0,
    unit: '%',
    icon: 'spirit_resist',
    scalingBase: 'spirit_resist_percent',
  },
  {
    label: 'Melee Resist',
    valueField: 'melee_resist_percent',
    fallback: 0,
    unit: '%',
    icon: 'melee_resist',
    scalingBase: 'melee_resist_percent',
  },
  {
    label: 'Debuff Resist',
    valueField: 'debuff_resist_percent',
    fallback: 0,
    unit: '%',
    icon: 'debuff_resist',
    scalingBase: 'debuff_resist_percent',
  },
  {
    label: 'Crit Reduction',
    valueField: 'crit_reduction_percent',
    fallback: 0,
    unit: '%',
    icon: 'crit_reduction',
    scalingBase: 'crit_reduction_percent',
  },
  {
    label: 'Move Speed',
    valueField: 'move_speed',
    fallback: 6.3,
    unit: 'm',
    icon: 'move_speed',
    scalingBase: 'move_speed',
  },
  {
    label: 'Sprint Speed',
    valueField: 'sprint_speed',
    fallback: 1.1,
    unit: 'm',
    icon: 'move_sprint',
    scalingBase: 'sprint_speed',
  },
  {
    label: 'Stamina Cooldown',
    valueField: 'stamina_cooldown',
    fallback: 4.5,
    unit: 's',
    icon: 'stamina_recovery',
    scalingBase: 'stamina_cooldown',
  },
  {
    label: 'Stamina Recovery',
    valueField: 'stamina_recovery_percent',
    fallback: 0,
    unit: '%',
    icon: 'stamina_recovery',
    scalingBase: 'stamina_recovery_percent',
  },
  {
    label: 'Stamina',
    valueField: 'stamina',
    fallback: 3,
    unit: '',
    icon: 'stamina',
    scalingBase: 'stamina',
  },
  {
    label: 'Dash Speed',
    valueField: 'dash_speed',
    fallback: 0,
    unit: 'm',
    icon: 'stamina',
    scalingBase: 'dash_speed',
  },
];

function parseScalingValue(value) {
  if (value == null) return null;
  const parsed = Number(String(value).trim());
  if (Number.isNaN(parsed) || parsed === 0) return null;
  return parsed;
}

function mapScaling(row, base) {
  if (!row || !base) return {scaling: 'none', scalingValue: '0'};
  const spirit = parseScalingValue(row[`${base}_spirit_scaling`]);
  const weapon = parseScalingValue(row[`${base}_weapon_scaling`]);
  const boon = parseScalingValue(row[`${base}_boon_scaling`]);

  if (spirit !== null) return {scaling: 'spirit', scalingValue: String(spirit)};
  if (weapon !== null) return {scaling: 'courage', scalingValue: String(weapon)};
  if (boon !== null) return {scaling: 'boon', scalingValue: String(boon)};
  return {scaling: 'none', scalingValue: '0'};
}

export function buildVitalityStatsArray(row) {
  if (!row) {
    // Fallback to defaults if no row is provided
    return STAT_DEFINITIONS.map((def) => ({
      label: def.label,
      value: String(def.fallback),
      unit: def.unit,
      icon: def.icon,
      scaling: 'none',
      scalingValue: '0',
    }));
  }

  return STAT_DEFINITIONS.map((definition) => ({
    label: definition.label,
    value: String(row[definition.valueField] ?? definition.fallback),
    unit: definition.unit,
    icon: definition.icon,
    ...mapScaling(row, definition.scalingBase),
  }));
}
