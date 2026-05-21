import { h } from 'preact';
import { useState } from 'preact/hooks';

import {buildTopSpiritStatsArray, buildSpiritPowerStat} from './spiritStatsMapper';
import { SCALING_ICONS, getNextScaling } from './scalingUtils';
import './HeroStatsPanelShared.css';
import './HeroStatsSpiritPanel.css';

function formatValue(value) {
  if (value === null || value === undefined) return '';
  const num = Number(String(value).trim());
  if (Number.isNaN(num)) return String(value);
  const text = num.toString();
  return text.includes('e') ? text : text.replace(/(?:\.0+|(?<=\.[0-9]*?)0+)$/, (match) => match === '.0' ? '' : match.replace(/0+$/, ''));
}

function SpiritStatCell({label, value, unit = '', icon = 'dot', scaling = 'none', onScalingChange = null}) {
  const handleClick = () => {
    if (onScalingChange) {
      const nextScaling = getNextScaling(scaling);
      onScalingChange(nextScaling);
    }
  };

  const scalingIcon = SCALING_ICONS[scaling || 'none'];

  return (
    <div class="spiritStatCell" onClick={handleClick} style={{cursor: 'pointer'}} data-scaling={scaling}>
      <span class={`spiritStatIcon spiritStatIcon--${icon}`} aria-hidden="true" />
      <div class="spiritStatText">
        <span class="spiritStatValue">{formatValue(value)}</span>
        {unit && <span class="spiritStatUnit">{unit}</span>}
        <span class="spiritStatLabel">{label}</span>
      </div>
      {scalingIcon && <div class={`statScalingIcon ${scalingIcon}`} title={`${scaling} scaling`} />}
    </div>
  );
}

function SpiritPowerCell({label, value, unit = '', icon = 'dot', scaling = 'none', onScalingChange = null}) {
  const handleClick = () => {
    if (onScalingChange) {
      const nextScaling = getNextScaling(scaling);
      onScalingChange(nextScaling);
    }
  };

  const scalingIcon = SCALING_ICONS[scaling || 'none'];

  return (
    <div class="spiritPowerCell" onClick={handleClick} style={{cursor: 'pointer'}} data-scaling={scaling}>
      <span class={`spiritStatIcon spiritStatIcon--${icon}`} aria-hidden="true" />
      <div class="spiritPowerCellContent">
        <div class="spiritPowerCellTop">
          <span class="spiritStatValue">{formatValue(value)}</span>
          {unit && <span class="spiritStatUnit">{unit}</span>}
          <span class="spiritStatLabel">{label}</span>
        </div>
      </div>
      {scalingIcon && <div class={`statScalingIcon ${scalingIcon}`} title={`${scaling} scaling`} />}
    </div>
  );
}

export default function HeroStatsSpiritPanel({hero, stats, spiritPowerStat: spiritPowerStatProp}) {
  const topStats = stats || buildTopSpiritStatsArray(hero);
  const spiritPowerStat = spiritPowerStatProp || buildSpiritPowerStat(hero);
  
  return (
    <div class="CitadelHeroStatsTech HeroStatsSpiritPanel">
      <div id="BackgroundContainer" />
      <div class="HeroStatsSpiritPanel__header">
        <label class="HeroStatsSpiritPanel__title">SPIRIT STATS</label>
      </div>

      <div class="HeroStatsSpiritPanel__gridSection">
        <div class="HeroStatsSpiritPanel__grid">
          {topStats.map((stat, statIndex) => (
            <SpiritStatCell 
              key={`spirit-top-${statIndex}`} 
              {...stat}
            />
          ))}
        </div>
      </div>

      <div class="HeroStatsSpiritPanel__impactSection">
        <div class="HeroStatsSpiritPanel__impactHeader">
          <label class="HeroStatsSpiritPanel__impactTitle">SPIRIT POWER IMPACT</label>
        </div>
        <div class="HeroStatsSpiritPanel__impactContent">
          <SpiritPowerCell 
            {...spiritPowerStat}
          />
          {spiritPowerStat.description && <div class="HeroStatsSpiritPanel__descriptionText">{spiritPowerStat.description}</div>}
        </div>
      </div>
    </div>
  );
}
