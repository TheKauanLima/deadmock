import {heroAssets} from '/src/Hero/heroes';

const getDatabaseHeroName = (heroId) => {
	const hero = heroAssets.find((entry) => entry.id === heroId || entry.label === heroId) || null;
	return hero?.label || heroId;
};

export async function fetchHeroVitalityStats(heroId) {
	try {
		const response = await fetch(`/api/heroes/${encodeURIComponent(getDatabaseHeroName(heroId))}/vitality-stats`);
		if (!response.ok) {
			throw new Error(`Failed to fetch vitality stats for hero ${heroId}`);
		}
		return await response.json();
	} catch (error) {
		console.error(`Error fetching vitality stats for hero ${heroId}:`, error);
		return null;
	}
}
