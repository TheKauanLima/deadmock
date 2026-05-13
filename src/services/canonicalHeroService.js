/**
 * Service for fetching canonical hero data from the database.
 * Canonical heroes (like the 38 Deadlock heroes) have their theme and asset paths stored in Supabase.
 */

import {heroAssets} from '/src/Hero/heroes';

let cachedHeroes = {};

const getDatabaseHeroName = (heroId) => {
	const hero = heroAssets.find((entry) => entry.id === heroId || entry.label === heroId) || null;
	return hero?.label || heroId;
};

export async function fetchHero(heroId) {
	if (cachedHeroes[heroId]) {
		return cachedHeroes[heroId];
	}

	try {
		const response = await fetch(`/api/heroes/${encodeURIComponent(getDatabaseHeroName(heroId))}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch hero ${heroId}`);
		}
		const hero = await response.json();
		hero.id = heroId;
		cachedHeroes[heroId] = hero;
		return hero;
	} catch (error) {
		console.error(`Error fetching hero ${heroId}:`, error);
		return null;
	}
}

export function clearCache() {
	cachedHeroes = {};
}
