import { h } from 'preact';
import { useState } from 'preact/hooks';
import './HeroStatsWeaponPanel.css';
import './HeroStatsPanelShared.css';
import '../styles/CitadelBaseStyles.css';

const SCALING_OPTIONS = ['none', 'spirit', 'courage', 'boon'];

function normalizeStat(stat) {
  return {
    scaling: 'none',
    scalingValue: '0',
    ...stat,
  };
}

function formatNumericDisplay(value) {
  if (value === null || value === undefined) return '';
  const num = typeof value === 'number' ? value : Number(String(value).trim());
  if (Number.isNaN(num)) return String(value);
  // Use JS default toString on numbers which produces the shortest representation
  // but avoid exponential notation for large/small numbers: use toLocaleString with maximumFractionDigits set high,
  // then trim trailing zeros and optional decimal point.
  const asFixed = num.toString();
  if (!asFixed.includes('e') && asFixed.includes('.')) {
    // trim trailing zeros
    return asFixed.replace(/(?:\.0+|(?<=\.[0-9]*?)0+)$/, (m) => m === '.0' ? '' : m.replace(/0+$/, ''));
  }
  return asFixed;
}

const DEFAULT_WEAPON_STATS = [
  { label: 'Bullet Damage', value: '3.6', unit: '', icon: 'bullet_damage', scaling: 'none', scalingValue: '0' },
  { label: 'Weapon Damage', value: '0', unit: '%', icon: 'dot', scaling: 'none', scalingValue: '0' },
  { label: 'Bullets per sec', value: '1.59', unit: '', icon: 'fire_rate', scaling: 'none', scalingValue: '0' },
  { label: 'Fire Rate', value: '0', unit: '%', icon: 'fire_rate', scaling: 'none', scalingValue: '0' },
  { label: 'Ammo', value: '9', unit: '', icon: 'ammo_clip_size', scaling: 'none', scalingValue: '0' },
  { label: 'Clip Size Increase', value: '0', unit: '%', icon: 'ammo_clip_size', scaling: 'none', scalingValue: '0' },
  { label: 'Reload Time', value: '0.35', unit: 's', icon: 'ammo_reload', scaling: 'none', scalingValue: '0' },
  { label: 'Reload Reduction', value: '0', unit: '%', icon: 'ammo_reload', scaling: 'none', scalingValue: '0' },
  { label: 'Bullet Velocity', value: '610', unit: 'm/s', icon: 'bullet_velocity', scaling: 'none', scalingValue: '0' },
  { label: 'Bullet Velocity Increase', value: '0', unit: '%', icon: 'bullet_velocity', scaling: 'none', scalingValue: '0' },
  { label: 'Bullet Lifesteal', value: '0', unit: '%', icon: 'health_steal_bullets', scaling: 'none', scalingValue: '0' },
  { label: 'Crit Bonus Scale', value: '0', unit: '%', icon: 'dot', scaling: 'none', scalingValue: '0' },
  { label: 'Light Melee', value: '50', unit: '', icon: 'melee', scaling: 'none', scalingValue: '0' },
  { label: 'Heavy Melee', value: '116', unit: '', icon: 'melee', scaling: 'none', scalingValue: '0' },
];

export default function WeaponPanel({
  weaponName = 'Generic Gun',
  weaponDesc = 'Weapon description',
  secondaryWeaponDesc = 'Secondary weapon description',
  gunImageSrc = '/panorama/images/heroes/guns/generic_gun_psd.png',
  weaponAttributes = [],
  weaponStats = DEFAULT_WEAPON_STATS,
  bulletDPS = null,
  weaponMinRange = null,
  weaponMaxRange = null,
  initialStats = [],
  secondaryStats = [],
  otherStats = [],
  showSecondaryWeapon = true,
  panelType = 'weapon', // weapon, armor, or tech
  isEditable = false,
  onSaveStats = null,
}) {
  const combinedWeaponStats = weaponStats.length
    ? weaponStats
    : [...initialStats, ...secondaryStats, ...otherStats];

  // Initialize state with weapon stats
  const [editedStats, setEditedStats] = useState(
    () => combinedWeaponStats.map((stat) => normalizeStat(stat))
  );
  
  const handleStatChange = (index, updates) => {
    const updated = [...editedStats];
    updated[index] = {
      ...updated[index],
      ...updates,
    };
    setEditedStats(updated);
  };

  const handleSave = () => {
    if (onSaveStats) {
      onSaveStats(editedStats);
    }
  };

  const handleCancel = () => {
    setEditedStats(weaponStats.map((stat) => normalizeStat(stat)));
  };
  const rootClass = [
    'CitadelHeroStatsWeapon',
    panelType === 'armor' && 'CitadelHeroStatsArmor',
    panelType === 'tech' && 'CitadelHeroStatsTech',
    !weaponDesc && 'NoWeaponDesc',
    !showSecondaryWeapon && 'NoSecondaryWeaponDesc',
    isEditable && 'isEditable',
  ]
    .filter(Boolean)
    .join(' ');

  const normalizedWeaponStats = combinedWeaponStats.map((stat) => normalizeStat(stat));

  // Use edited stats if in editable mode
  const displayStats = isEditable ? editedStats : normalizedWeaponStats;

  const weaponStatRows = [];
  for (let index = 0; index < displayStats.length; index += 2) {
    weaponStatRows.push(displayStats.slice(index, index + 2));
  }

  return (
    <div class={rootClass}>
      <div id="BackgroundContainer" />

      <div id="WeaponInfoContainer">
        <img
          id="GunImage"
          src={gunImageSrc}
          alt="Weapon"
          scaling="cover"
        />
        
        <div class="weaponNameAndAttributes TopBottomFlow">
          <label class="statTitle">WEAPON STATS</label>
          <label class="WeaponName" style="margin-top: 2px;">{weaponName}</label>
          <div id="WeaponAttributesContainer">
            {weaponAttributes.map((attr, i) => (
              <div key={i} id="AttributeLabel">
                {attr}
              </div>
            ))}
          </div>
        </div>

        {bulletDPS != null && (
          <div id="BulletDPSContainer">
            <span
              class="BulletDPSIcon"
              role="img"
              aria-label="Bullet damage"
            />
            <div id="StatContainer_DPS" class="statAttributeContainer">
              <label class="CitadelModifiedAttributeLabel DPSValue">
                <span>{formatNumericDisplay(bulletDPS)}</span>
                <span class="DPSUnit">DPS</span>
              </label>
            </div>
          </div>
        )}

        {(weaponMinRange || weaponMaxRange) && (
          <div id="WeaponFalloffRange">
            <label class="FalloffLabel">Falloff Range</label>
            <div class="WeaponRangeContainer">
              {weaponMinRange != null && (
                <div id="StatContainer_WeaponRangeFalloffMin" class="statAttributeContainer">
                  <label class="CitadelModifiedAttributeLabel FalloffValue">
                    <span>{formatNumericDisplay(weaponMinRange)}</span>
                    <span class="FalloffUnit">m</span>
                  </label>
                </div>
              )}
              <div class="RangeArrow" />
              {weaponMaxRange != null && (
                <div id="StatContainer_WeaponRangeFalloffMax" class="statAttributeContainer">
                  <label class="CitadelModifiedAttributeLabel FalloffValue">
                    <span>{formatNumericDisplay(weaponMaxRange)}</span>
                    <span class="FalloffUnit">m</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div id="WeaponDisplayStats" class="displayStatsContainer WeaponStatsDisplay TopBottomFlow">
        {weaponDesc && <label class="weaponDesc">{weaponDesc}</label>}
        <div class="weaponStatsGrid">
          {weaponStatRows.map((row, rowIndex) => (
            <div
              key={`weapon-row-${rowIndex}`}
              class={`weaponStatsRow ${rowIndex === weaponStatRows.length - 1 ? 'weaponStatsRow--final' : ''}`}
            >
              {row.map((stat, statIndex) => {
                const absoluteIndex = rowIndex * 2 + statIndex;
                return isEditable ? (
                  <CompactStatElementEditable
                    key={`weapon-stat-${rowIndex}-${statIndex}`}
                    {...stat}
                    onChange={(updates) => handleStatChange(absoluteIndex, updates)}
                  />
                ) : (
                  <CompactStatElement
                    key={`weapon-stat-${rowIndex}-${statIndex}`}
                    {...stat}
                  />
                );
              })}
            </div>
          ))}
        </div>
        {isEditable && (
          <div class="statsEditActions">
            <button type="button" class="statsEditButton statsEditButton--save" onClick={handleSave}>
              Save
            </button>
            <button type="button" class="statsEditButton statsEditButton--cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CompactStatElement({ label, value, unit = '', icon = 'dot', scaling = 'none', scalingValue = '0' }) {
  const iconClass = [
    'weaponStatIcon',
    `weaponStatIcon--${icon}`,
  ].join(' ');
  const scalingIconSrc = scaling === 'none' ? null : `/panorama/images/shop/keystat_${scaling}_arrow_png.png`;

  return (
    <div class="weaponStatCell weaponStatCell--viewOnly">
      <span class={iconClass} aria-hidden="true" />
      <div class="weaponStatText">
        <span class="weaponStatValue">{formatNumericDisplay(value)}</span>
        {unit && <span class="weaponStatUnit">{unit}</span>}
        <span class="weaponStatLabel">{label}</span>
      </div>
      {scalingIconSrc && (
        <div class="statScalingIndicator" title={`${scaling} scaling ${scalingValue}`}>
          <img class="scalingIcon" src={scalingIconSrc} alt={scaling} />
          <span class="scalingValueText">{formatNumericDisplay(scalingValue)}</span>
        </div>
      )}
    </div>
  );
}

function CompactStatElementEditable({ label, value, unit = '', icon = 'dot', scaling = 'none', scalingValue = '0', onChange }) {
  const iconClass = [
    'weaponStatIcon',
    `weaponStatIcon--${icon}`,
  ].join(' ');

  const handleValueChange = (e) => {
    onChange({ value: e.target.value });
  };

  const handleScalingClick = () => {
    const currentIndex = SCALING_OPTIONS.indexOf(scaling);
    const nextIndex = (currentIndex + 1) % SCALING_OPTIONS.length;
    const nextScaling = SCALING_OPTIONS[nextIndex];
    onChange({
      scaling: nextScaling,
      scalingValue: nextScaling === 'none' ? '0' : scalingValue,
    });
  };

  const handleScalingValueChange = (e) => {
    onChange({ scalingValue: e.target.value });
  };

  return (
    <div class="weaponStatCell weaponStatCell--editable" onClick={handleScalingClick} role="button" tabIndex={0}>
      <span class={iconClass} aria-hidden="true" />
      <div class="weaponStatText weaponStatText--editable">
        <input
          type="text"
          class="weaponStatValueInput"
          value={value}
          onChange={handleValueChange}
          placeholder="0"
          onClick={(e) => e.stopPropagation()}
        />
        {unit && <span class="weaponStatUnit">{unit}</span>}
        <span class="weaponStatLabel">{label}</span>
      </div>
      <div class="statScalingControl">
        <button
          class="scalingIconButton"
          onClick={handleScalingClick}
          title={`Click to change scaling: ${scaling}`}
          type="button"
        >
          {scaling !== 'none' && (
            <img
              src={`/panorama/images/shop/keystat_${scaling}_arrow_png.png`}
              alt={scaling}
              class="scalingIcon"
            />
          )}
          {scaling === 'none' && <span class="scalingIconPlaceholder">–</span>}
        </button>
        {scaling !== 'none' && (
          <input
            type="text"
            class="scalingValueInput"
            value={scalingValue}
            onChange={handleScalingValueChange}
            placeholder="0"
            title={`${scaling.charAt(0).toUpperCase() + scaling.slice(1)} scaling value`}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
    </div>
  );
}
