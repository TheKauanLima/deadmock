import { h } from 'preact';
import './HeroStatsWeaponPanel.css';
import './HeroStatsPanelShared.css';
import '../styles/CitadelBaseStyles.css';

const DEFAULT_WEAPON_STATS = [
  { label: 'Bullet Damage', value: '3.6', unit: '', icon: 'bullet' },
  { label: 'Weapon Damage', value: '0', unit: '%', icon: 'dot' },
  { label: 'Bullets per sec', value: '1.59', unit: '', icon: 'fireRate' },
  { label: 'Fire Rate', value: '0', unit: '%', icon: 'dot' },
  { label: 'Ammo', value: '9', unit: '', icon: 'dot' },
  { label: 'Clip Size Increase', value: '0', unit: '%', icon: 'dot' },
  { label: 'Reload Time', value: '0.35', unit: 's', icon: 'dot' },
  { label: 'Reload Reduction', value: '0', unit: '%', icon: 'dot' },
  { label: 'Bullet Velocity', value: '610', unit: 'm/s', icon: 'dot' },
  { label: 'Bullet Velocity Increase', value: '0', unit: '%', icon: 'dot' },
  { label: 'Bullet Lifesteal', value: '0', unit: '%', icon: 'dot' },
  { label: 'Crit Bonus Scale', value: '0', unit: '%', icon: 'dot' },
  { label: 'Light Melee', value: '50', unit: '', icon: 'melee' },
  { label: 'Heavy Melee', value: '116', unit: '', icon: 'melee' },
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
}) {
  const rootClass = [
    'CitadelHeroStatsWeapon',
    panelType === 'armor' && 'CitadelHeroStatsArmor',
    panelType === 'tech' && 'CitadelHeroStatsTech',
    !weaponDesc && 'NoWeaponDesc',
    !showSecondaryWeapon && 'NoSecondaryWeaponDesc',
  ]
    .filter(Boolean)
    .join(' ');

  const combinedWeaponStats = weaponStats.length
    ? weaponStats
    : [...initialStats, ...secondaryStats, ...otherStats];

  const weaponStatRows = [];
  for (let index = 0; index < combinedWeaponStats.length; index += 2) {
    weaponStatRows.push(combinedWeaponStats.slice(index, index + 2));
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
          <label class="WeaponName" style="margin-top: 10px;">{weaponName}</label>
          <div id="WeaponAttributesContainer">
            {weaponAttributes.map((attr, i) => (
              <div key={i} id="AttributeLabel">
                {attr}
              </div>
            ))}
          </div>
        </div>

        {bulletDPS && (
          <div id="BulletDPSContainer">
            <span
              class="BulletDPSIcon"
              role="img"
              aria-label="Bullet damage"
            />
            <div id="StatContainer_DPS" class="statAttributeContainer">
              <label class="CitadelModifiedAttributeLabel DPSValue">
                <span>{bulletDPS}</span>
                <span class="DPSUnit">DPS</span>
              </label>
            </div>
          </div>
        )}

        {(weaponMinRange || weaponMaxRange) && (
          <div id="WeaponFalloffRange">
            <label class="FalloffLabel">Falloff Range</label>
            <div class="WeaponRangeContainer">
              {weaponMinRange && (
                <div id="StatContainer_WeaponRangeFalloffMin" class="statAttributeContainer">
                  <label class="CitadelModifiedAttributeLabel FalloffValue">
                    <span>{weaponMinRange}</span>
                    <span class="FalloffUnit">m</span>
                  </label>
                </div>
              )}
              <div class="RangeArrow" />
              {weaponMaxRange && (
                <div id="StatContainer_WeaponRangeFalloffMax" class="statAttributeContainer">
                  <label class="CitadelModifiedAttributeLabel FalloffValue">
                    <span>{weaponMaxRange}</span>
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
              {row.map((stat, statIndex) => (
                <CompactStatElement
                  key={`weapon-stat-${rowIndex}-${statIndex}`}
                  {...stat}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompactStatElement({ label, value, unit = '', icon = 'dot' }) {
  const iconClass = [
    'weaponStatIcon',
    `weaponStatIcon--${icon}`,
  ].join(' ');

  return (
    <div class="weaponStatCell">
      <span class={iconClass} aria-hidden="true" />
      <div class="weaponStatText">
        <span class="weaponStatValue">{value}</span>
        {unit && <span class="weaponStatUnit">{unit}</span>}
        <span class="weaponStatLabel">{label}</span>
      </div>
    </div>
  );
}
