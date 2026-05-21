/**
 * Service for fetching canonical hero data from the database.
 * Canonical heroes (like the 38 Deadlock heroes) have their theme and asset paths stored in Supabase.
 */

import {heroAssets} from '/src/Hero/heroes';

let cachedHeroes = {};
let allHeroesPromise = null;

const heroIdByLabel = new Map(heroAssets.map((entry) => [entry.label, entry.id]));

const cacheHero = (hero) => {
	const clientHeroId = heroIdByLabel.get(hero.label) || hero.id;
	const mapped = {...hero, id: clientHeroId};
	cachedHeroes[clientHeroId] = mapped;
	return mapped;
};

const getDatabaseHeroName = (heroId) => {
	const hero = heroAssets.find((entry) => entry.id === heroId || entry.label === heroId) || null;
	return hero?.label || heroId;
};

export async function fetchHero(heroId) {
	if (cachedHeroes[heroId]) {
		return cachedHeroes[heroId];
	}

	const all = await fetchAllHeroes();
	if (cachedHeroes[heroId]) {
		return cachedHeroes[heroId];
	}
	if (all.length > 0) {
		return null;
	}

	try {
		const response = await fetch(`/api/heroes/${encodeURIComponent(getDatabaseHeroName(heroId))}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch hero ${heroId}`);
		}
		const hero = await response.json();
		return cacheHero(hero);
	} catch (error) {
		console.error(`Error fetching hero ${heroId}:`, error);
		return null;
	}
}

export async function fetchAllHeroes() {
	if (Object.keys(cachedHeroes).length > 0) {
		return Object.values(cachedHeroes);
	}

	if (!allHeroesPromise) {
		allHeroesPromise = fetch('/api/heroes')
			.then(async (response) => {
				if (!response.ok) {
					throw new Error('Failed to fetch heroes');
				}
				const heroes = await response.json();
				for (const hero of heroes) {
					cacheHero(hero);
				}
				return Object.values(cachedHeroes);
			})
			.catch((error) => {
				console.error('Error fetching heroes:', error);
				return [];
			})
			.finally(() => {
				allHeroesPromise = null;
			});
	}

	return allHeroesPromise;
}

export async function saveCustomHero(heroData, accessToken) {
	const response = await fetch('/api/heroes', {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(heroData),
	});

	if (!response.ok) {
		const rawText = await response.text().catch(() => '');
		let payload = null;
		if (rawText) {
			try {
				payload = JSON.parse(rawText);
			} catch (_error) {
				payload = null;
			}
		}

		const fallbackMessage = response.status === 404
			? 'Save endpoint unavailable. Restart the API server.'
			: `Failed to save custom hero (HTTP ${response.status})`;
		const error = new Error(payload?.error || payload?.message || rawText || fallbackMessage);
		error.code = payload?.code;
		error.status = response.status;
		error.payload = payload || rawText;
		throw error;
	}

	return response.json();
}

export function clearCache() {
	cachedHeroes = {};
	allHeroesPromise = null;
}
