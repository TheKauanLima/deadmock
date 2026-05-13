import {hasSupabaseConfig, supabase} from './supabase';

let heroCatalogCache = null;
let heroClusterThemeCache = null;
let heroCatalogPromise = null;
let heroClusterThemePromise = null;

const normalizeThemeRow = (row) => ({
	heroId: row.hero_id,
	heroFolder: row.hero_folder,
	signatureColor: row.signature_color,
	rectangleColor: row.rectangle_color,
	textLabels: row.text_labels || [],
	textColor: row.text_color,
	abilityColor: row.ability_color,
	circleColor: row.circle_color,
	abilityIcons: row.ability_icons || [],
});

async function loadHeroCatalog() {
	if (heroCatalogCache) {
		return heroCatalogCache;
	}

	if (!hasSupabaseConfig || !supabase) {
		return [];
	}

	if (!heroCatalogPromise) {
		heroCatalogPromise = supabase
			.from('hero_catalog')
			.select('*')
			.order('sort_order', {ascending: true})
			.order('display_label', {ascending: true})
			.then(({data, error}) => {
				if (error) {
					throw error;
				}

				heroCatalogCache = data || [];
				return heroCatalogCache;
			})
			.finally(() => {
				heroCatalogPromise = null;
			});
	}

	return heroCatalogPromise;
}

async function loadHeroClusterThemeMap() {
	if (heroClusterThemeCache) {
		return heroClusterThemeCache;
	}

	if (!hasSupabaseConfig || !supabase) {
		return {};
	}

	if (!heroClusterThemePromise) {
		heroClusterThemePromise = supabase
			.from('hero_cluster_themes')
			.select('*')
			.then(({data, error}) => {
				if (error) {
					throw error;
				}

				heroClusterThemeCache = Object.fromEntries((data || []).map((row) => [row.hero_id, normalizeThemeRow(row)]));
				return heroClusterThemeCache;
			})
			.finally(() => {
				heroClusterThemePromise = null;
			});
	}

	return heroClusterThemePromise;
}

export async function listHeroCatalog() {
	return loadHeroCatalog();
}

export async function listHeroClusterThemes() {
	const themeMap = await loadHeroClusterThemeMap();
	return Object.values(themeMap);
}

export async function getHeroClusterTheme(heroId) {
	if (!heroId) {
		return null;
	}

	const themeMap = await loadHeroClusterThemeMap();
	return themeMap[heroId] || null;
}

export function clearHeroThemeCache() {
	heroCatalogCache = null;
	heroClusterThemeCache = null;
}