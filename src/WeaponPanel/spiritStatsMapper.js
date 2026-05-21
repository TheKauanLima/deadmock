const TOP_STATS_DEFINITIONS = [
  {
    label: 'Ability Cooldown',
    valueField: 'ability_cooldown_percent',
    fallback: 0,
    unit: '%',
    icon: 'ability_cooldown',
    scalingBase: 'ability_cooldown_percent',
  },
  {
    label: 'Ability Duration',
    valueField: 'ability_duration_percent',
    fallback: 0,
    unit: '%',
    icon: 'ability_duration',
    scalingBase: 'ability_duration_percent',
  },
  {
    label: 'Ability Range',
    valueField: 'ability_range_percent',
    fallback: 0,
    unit: '%',
    icon: 'ability_range',
    scalingBase: 'ability_range_percent',
  },
  {
    label: 'Spirit Lifesteal',
    valueField: 'spirit_lifesteal_percent',
    fallback: 0,
    unit: '%',
    icon: 'spirit_lifesteal',
    scalingBase: 'spirit_lifesteal_percent',
  },
  {
    label: 'Max Charges Increase',
    valueField: 'max_charges_increase',
    fallback: 0,
    unit: '',
    icon: 'max_charges',
    scalingBase: 'max_charges_increase',
  },
  {
    label: 'Charge Cooldown',
    valueField: 'charge_cooldown_percent',
    fallback: 0,
    unit: '%',
    icon: 'charge_cooldown',
    scalingBase: 'charge_cooldown_percent',
  },
];

const SPIRIT_POWER_DEFINITION = {
  label: 'Spirit Power',
  valueField: 'spirit_power',
  fallback: 0,
  unit: '',
  icon: 'spirit_power',
  scalingBase: 'spirit_power',
  description: 'Spirit Power increases the effectiveness of your Abilities and items.',
};

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

export function buildTopSpiritStatsArray(row) {
  if (!row) {
    return TOP_STATS_DEFINITIONS.map((def) => ({
      label: def.label,
      value: String(def.fallback),
      unit: def.unit,
      icon: def.icon,
      scaling: 'none',
      scalingValue: '0',
    }));
  }

  return TOP_STATS_DEFINITIONS.map((definition) => ({
    label: definition.label,
    value: String(row[definition.valueField] ?? definition.fallback),
    unit: definition.unit,
    icon: definition.icon,
    ...mapScaling(row, definition.scalingBase),
  }));
}

export function buildSpiritPowerStat(row) {
  if (!row) {
    return {
      label: SPIRIT_POWER_DEFINITION.label,
      value: String(SPIRIT_POWER_DEFINITION.fallback),
      unit: SPIRIT_POWER_DEFINITION.unit,
      icon: SPIRIT_POWER_DEFINITION.icon,
      description: SPIRIT_POWER_DEFINITION.description,
      scaling: 'none',
      scalingValue: '0',
    };
  }

  return {
    label: SPIRIT_POWER_DEFINITION.label,
    value: String(row[SPIRIT_POWER_DEFINITION.valueField] ?? SPIRIT_POWER_DEFINITION.fallback),
    unit: SPIRIT_POWER_DEFINITION.unit,
    icon: SPIRIT_POWER_DEFINITION.icon,
    description: SPIRIT_POWER_DEFINITION.description,
    ...mapScaling(row, SPIRIT_POWER_DEFINITION.scalingBase),
  };
}

export function buildSpiritStatsArray(row) {
  return buildTopSpiritStatsArray(row);
}
