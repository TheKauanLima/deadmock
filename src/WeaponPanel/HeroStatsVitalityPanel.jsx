import { h } from 'preact';
import { useState } from 'preact/hooks';

import {buildVitalityStatsArray} from './vitalityStatsMapper';
import { SCALING_TYPES, SCALING_ICONS, getNextScaling } from './scalingUtils';
import './HeroStatsPanelShared.css';
import './HeroStatsVitalityPanel.css';

function formatValue(value) {
  if (value === null || value === undefined) return '';
  const num = Number(String(value).trim());
  if (Number.isNaN(num)) return String(value);
  const text = num.toString();
  return text.includes('e') ? text : text.replace(/(?:\.0+|(?<=\.[0-9]*?)0+)$/, (match) => match === '.0' ? '' : match.replace(/0+$/, ''));
}

function splitRows(items) {
  const rows = [];
  for (let index = 0; index < items.length; index += 2) rows.push(items.slice(index, index + 2));
  return rows;
}

function VitalityStatCell({label, value, unit = '', icon = 'dot', scaling = 'none', onScalingChange = null}) {
  const handleClick = () => {
    if (onScalingChange) {
      const nextScaling = getNextScaling(scaling);
      onScalingChange(nextScaling);
    }
  };

  const scalingIcon = SCALING_ICONS[scaling || 'none'];

  return (
    <div class="vitalityStatCell" onClick={handleClick} style={{cursor: 'pointer'}} data-scaling={scaling}>
      <span class={`vitalityStatIcon vitalityStatIcon--${icon}`} aria-hidden="true" />
      <div class="vitalityStatText">
        <span class="vitalityStatValue">{formatValue(value)}</span>
        {unit && <span class="vitalityStatUnit">{unit}</span>}
        <span class="vitalityStatLabel">{label}</span>
      </div>
      {scalingIcon && <div class={`statScalingIcon ${scalingIcon}`} title={`${scaling} scaling`} />}
    </div>
  );
}

export default function HeroStatsVitalityPanel({hero, stats}) {
  const vitalityStats = stats || buildVitalityStatsArray(hero);

  const topRows = splitRows(vitalityStats.slice(0, 9));
  const bottomRows = splitRows(vitalityStats.slice(9));

  return (
    <div class="CitadelHeroStatsArmor HeroStatsVitalityPanel">
      <div id="BackgroundContainer" />
      <div class="HeroStatsVitalityPanel__header">
        <label class="HeroStatsVitalityPanel__title">VITALITY STATS</label>
      </div>

      <div class="HeroStatsVitalityPanel__gridSection">
        {topRows.map((row, rowIndex) => (
          <div key={`vitality-top-${rowIndex}`} class="HeroStatsVitalityPanel__row">
            {row.map((stat, statIndexInRow) => (
              <VitalityStatCell 
                key={`vitality-top-${rowIndex}-${statIndexInRow}`} 
                {...stat}
              />
            ))}
          </div>
        ))}
      </div>

      <div class="HeroStatsVitalityPanel__bottomSection">
        {bottomRows.map((row, rowIndex) => (
          <div key={`vitality-bottom-${rowIndex}`} class="HeroStatsVitalityPanel__row">
            {row.map((stat, statIndexInRow) => (
              <VitalityStatCell 
                key={`vitality-bottom-${rowIndex}-${statIndexInRow}`} 
                {...stat}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
