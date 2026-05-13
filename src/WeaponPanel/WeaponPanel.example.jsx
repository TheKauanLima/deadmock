import { WeaponPanel } from '../WeaponPanel';

/**
 * Example usage of WeaponPanel component
 * 
 * Props:
 * - weaponName: string - Display name of weapon
 * - weaponDesc: string - Main weapon description
 * - secondaryWeaponDesc: string - Secondary weapon description (optional)
 * - gunImageSrc: string - Path to weapon image
 * - weaponAttributes: string[] - Array of attribute labels
 * - bulletDPS: number - Bullet DPS value (optional)
 * - weaponMinRange: number - Minimum range value (optional)
 * - weaponMaxRange: number - Maximum range value (optional)
 * - initialStats: object[] - Array of stat objects with label, value, isZero, hasScaling
 * - secondaryStats: object[] - Secondary stats array (optional)
 * - otherStats: object[] - Other stats array (optional)
 * - showSecondaryWeapon: boolean - Show/hide secondary weapon section
 * - panelType: 'weapon' | 'armor' | 'tech' - Changes background gradient
 */

export function WeaponPanelExample() {
  const exampleWeaponStats = [
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

  return (
    <WeaponPanel
      weaponName="Plasma Rifle"
      weaponDesc="A high-tech energy weapon with controlled recoil and strong range."
      secondaryWeaponDesc="Alt fire: Charged shot"
      gunImageSrc="/images/heroes/guns/Abrams_Weapon.png"
      weaponAttributes={['Full Auto', 'Hitscan']}
      bulletDPS={105}
      weaponMinRange={10}
      weaponMaxRange={40}
      weaponStats={exampleWeaponStats}
      showSecondaryWeapon={true}
      panelType="weapon"
    />
  );
}
