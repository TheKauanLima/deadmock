const STAT_DEFINITIONS = [
  {
    label: 'Max Health',
    valueField: 'max_health',
    fallback: 810,
    unit: '',
    icon: 'max_health',
  },
  {
    label: 'Health Regen',
    valueField: 'health_regen',
    fallback: 1.5,
    unit: '',
    icon: 'health_regen',
  },
  {
    label: 'Heal Amp',
    valueField: 'heal_amp',
    fallback: 0,
    unit: '%',
    icon: 'heal_amp',
  },
  {
    label: 'Non-Combat Regen',
    valueField: 'non_combat_regen',
    fallback: 0,
    unit: '',
    icon: 'health_regen',
  },
  {
    label: 'Bullet Resist',
    valueField: 'bullet_resist',
    fallback: 0,
    unit: '%',
    icon: 'bullet_resist',
  },
  {
    label: 'Spirit Resist',
    valueField: 'spirit_resist',
    fallback: 0,
    unit: '%',
    icon: 'spirit_resist',
  },
  {
    label: 'Melee Resist',
    valueField: 'melee_resist',
    fallback: 0,
    unit: '%',
    icon: 'melee_resist',
  },
  {
    label: 'Debuff Resist',
    valueField: 'debuff_resist',
    fallback: 0,
    unit: '%',
    icon: 'debuff_resist',
  },
  {
    label: 'Crit Reduction',
    valueField: 'crit_reduction',
    fallback: 0,
    unit: '%',
    icon: 'crit_reduction',
  },
  {
    label: 'Move Speed',
    valueField: 'move_speed',
    fallback: 6.3,
    unit: 'm',
    icon: 'move_speed',
  },
  {
    label: 'Sprint Speed',
    valueField: 'sprint_speed',
    fallback: 1.1,
    unit: 'm',
    icon: 'move_sprint',
  },
  {
    label: 'Stamina Cooldown',
    valueField: 'stamina_cooldown',
    fallback: 4.5,
    unit: 's',
    icon: 'stamina_recovery',
  },
  {
    label: 'Stamina Recovery',
    valueField: 'stamina_recovery',
    fallback: 0,
    unit: '%',
    icon: 'stamina_recovery',
  },
  {
    label: 'Stamina',
    valueField: 'stamina',
    fallback: 3,
    unit: '',
    icon: 'stamina',
  },
  {
    label: 'Dash Speed',
    valueField: 'dash_speed',
    fallback: 0,
    unit: 'm',
    icon: 'stamina',
  },
];

function readFirst(source, keys) {
  if (!source) return null;
  for (const key of keys) {
    if (source[key] != null) return source[key];
  }
  return null;
}

export function buildVitalityStatsArray(hero) {
  return STAT_DEFINITIONS.map((definition) => ({
    label: definition.label,
    value: String(readFirst(hero, [definition.valueField, definition.label]) ?? definition.fallback),
    unit: definition.unit,
    icon: definition.icon,
  }));
}
