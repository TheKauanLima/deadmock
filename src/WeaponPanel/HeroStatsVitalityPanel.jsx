import { h } from 'preact';

import {buildVitalityStatsArray} from './vitalityStatsMapper';
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

function VitalityStatCell({label, value, unit = '', icon = 'dot'}) {
  return (
    <div class="vitalityStatCell">
      <span class={`vitalityStatIcon vitalityStatIcon--${icon}`} aria-hidden="true" />
      <div class="vitalityStatText">
        <span class="vitalityStatValue">{formatValue(value)}</span>
        {unit && <span class="vitalityStatUnit">{unit}</span>}
        <span class="vitalityStatLabel">{label}</span>
      </div>
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
            {row.map((stat, statIndex) => (
              <VitalityStatCell key={`vitality-top-${rowIndex}-${statIndex}`} {...stat} />
            ))}
          </div>
        ))}
      </div>

      <div class="HeroStatsVitalityPanel__bottomSection">
        {bottomRows.map((row, rowIndex) => (
          <div key={`vitality-bottom-${rowIndex}`} class="HeroStatsVitalityPanel__row">
            {row.map((stat, statIndex) => (
              <VitalityStatCell key={`vitality-bottom-${rowIndex}-${statIndex}`} {...stat} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
