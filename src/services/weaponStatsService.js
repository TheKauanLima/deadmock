import {heroAssets} from '/src/Hero/heroes';

let cached = {};

const getDatabaseHeroName = (heroId) => {
  const hero = heroAssets.find((entry) => entry.id === heroId || entry.label === heroId) || null;
  return hero?.label || heroId;
};

export async function fetchHeroWeaponStats(heroId) {
  if (cached[heroId]) return cached[heroId];
  try {
    const name = getDatabaseHeroName(heroId);
    const res = await fetch(`/api/heroes/${encodeURIComponent(name)}/weapon-stats`);
    if (!res.ok) throw new Error('Failed to fetch weapon stats');
    const json = await res.json();
    cached[heroId] = json;
    return json;
  } catch (err) {
    console.error('fetchHeroWeaponStats error', err);
    return null;
  }
}

export function clearWeaponStatsCache() { cached = {}; }
