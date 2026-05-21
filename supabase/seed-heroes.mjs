import 'dotenv/config';

import {readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

import {pool} from '../server/db.js';
import {heroAssets} from '../src/Hero/heroes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = process.argv[2];
if (!csvPath) {
	throw new Error('Usage: node supabase/seed-heroes.mjs <path-to-heroes_rows.csv>');
}

const normalizeKey = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^the/, '');
const normalizeFolder = (value) => String(value || '').toLowerCase().replace(/\s+/g, '_').replace(/&/g, 'and');

const toPublicPath = (absPath) => absPath.replace(/\\/g, '/').split('/public/')[1] || '';

const heroFolderOverrides = {
	GreyTalon: 'grey_talon',
	LadyGeist: 'geist',
	MoKrill: 'krill',
	Apollo: 'astro',
	Celeste: 'fencer',
	Graves: 'necro',
	Paige: 'bookworm',
	Venator: 'unicorn',
	Paradox: 'chrono',
	Sinclair: 'priest',
	Mina: 'vampirebat',
	Silver: 'werewolf',
	Ivy: 'tengu',
	Dynamo: 'sumo',
	Pocket: 'synth',
	Rem: 'familiar',
	Vindicta: 'hornet',
	Victor: 'frank',
	Vyper: 'viper',
};

const heroBackgroundOverrides = {
	Apollo: 'astro',
	Celeste: 'fencer',
	Graves: 'magician',
	LadyGeist: 'geist',
	MoKrill: 'krill',
	Paige: 'patience',
	Venator: 'unicorn',
};

const defaultTheme = {
	signatureColor: '#ffefd6',
	rectangleColor: '#cccccc',
	textLabels: ['TBD', 'TBD', 'TBD'],
	textColor: '#ffefd6',
	abilityColor: '#cccccc',
	circleColor: '#cccccc',
	abilityIcons: [],
};

const manualThemes = {
	Abrams: {
		signatureColor: '#ffefd6',
		rectangleColor: '#2192b1',
		textLabels: ['TANK', 'BRAWLER', 'BULL-HEADED'],
		textColor: '#ffefd6',
		abilityColor: '#061d27',
		circleColor: '#247fa3',
		abilityIcons: ['siphon_life', 'shoulder_charge', 'infernal_resilience', 'seismic_impact'],
	},
};

const abramsWeaponStats = {
	bullet_dps: 45,
	bullet_dps_boon_scaling: 0,
	bullet_dps_spirit_scaling: 0,
	bullet_dps_weapon_scaling: 0,
	weapon_name: 'Case Closed',
	weapon_attributes: ['Spreadshot', 'Close Range'],
	weapon_image_path: '/panorama/images/heroes/guns/Abrams_Weapon.png',
	weapon_description: 'Reloads single shells at a time. Can be interrupted.',
	weapon_min_falloff_range: 17,
	weapon_min_falloff_range_boon_scaling: 0,
	weapon_min_falloff_range_spirit_scaling: 0,
	weapon_min_falloff_range_weapon_scaling: 0,
	weapon_max_falloff_range: 40,
	weapon_max_falloff_range_boon_scaling: 0,
	weapon_max_falloff_range_spirit_scaling: 0,
	weapon_max_falloff_range_weapon_scaling: 0,
	bullet_damage: 3.6,
	bullet_damage_boon_scaling: 0,
	bullet_damage_spirit_scaling: 0,
	bullet_damage_weapon_scaling: 0,
	weapon_damage_percent: 0,
	weapon_damage_percent_boon_scaling: 0,
	weapon_damage_percent_spirit_scaling: 0,
	weapon_damage_percent_weapon_scaling: 0,
	bullets_per_sec: 1.59,
	bullets_per_sec_boon_scaling: 0,
	bullets_per_sec_spirit_scaling: 0,
	bullets_per_sec_weapon_scaling: 0,
	fire_rate_percent: 0,
	fire_rate_percent_boon_scaling: 0,
	fire_rate_percent_spirit_scaling: 0,
	fire_rate_percent_weapon_scaling: 0,
	ammo: 9,
	ammo_boon_scaling: 0,
	ammo_spirit_scaling: 0,
	ammo_weapon_scaling: 0,
	clip_size_increase_percent: 0,
	clip_size_increase_percent_boon_scaling: 0,
	clip_size_increase_percent_spirit_scaling: 0,
	clip_size_increase_percent_weapon_scaling: 0,
	reload_time: 0.35,
	reload_time_boon_scaling: 0,
	reload_time_spirit_scaling: 0,
	reload_time_weapon_scaling: 0,
	reload_reduction_percent: 0,
	reload_reduction_percent_boon_scaling: 0,
	reload_reduction_percent_spirit_scaling: 0,
	reload_reduction_percent_weapon_scaling: 0,
	bullet_velocity: 610,
	bullet_velocity_boon_scaling: 0,
	bullet_velocity_spirit_scaling: 0,
	bullet_velocity_weapon_scaling: 0,
	bullet_velocity_increase_percent: 0,
	bullet_velocity_increase_percent_boon_scaling: 0,
	bullet_velocity_increase_percent_spirit_scaling: 0,
	bullet_velocity_increase_percent_weapon_scaling: 0,
	bullet_lifesteal_percent: 0,
	bullet_lifesteal_percent_boon_scaling: 0,
	bullet_lifesteal_percent_spirit_scaling: 0,
	bullet_lifesteal_percent_weapon_scaling: 0,
	crit_bonus_scale_percent: 0,
	crit_bonus_scale_percent_boon_scaling: 0,
	crit_bonus_scale_percent_spirit_scaling: 0,
	crit_bonus_scale_percent_weapon_scaling: 0,
	light_melee_damage: 50,
	light_melee_damage_boon_scaling: 0,
	light_melee_damage_spirit_scaling: 0,
	light_melee_damage_weapon_scaling: 0,
	heavy_melee_damage: 116,
	heavy_melee_damage_boon_scaling: 0,
	heavy_melee_damage_spirit_scaling: 0,
	heavy_melee_damage_weapon_scaling: 0,
};

const readCsvRows = (fileText) => {
	const lines = fileText.trim().split(/\r?\n/);
	const headers = lines.shift().split(',');
	return lines
		.filter(Boolean)
		.map((line) => {
			const values = line.split(',');
			return headers.reduce((row, header, index) => {
				row[header] = values[index];
				return row;
			}, {});
		});
};

const extractHeroClusterThemes = async () => {
	const source = readFileSync(path.resolve(__dirname, '../src/Background/HeroInfoCluster.jsx'), 'utf8');
	const startMarker = 'const heroClusterThemes = {';
	const startIndex = source.indexOf(startMarker);
	if (startIndex === -1) {
		// If the heroClusterThemes object isn't present in the source file, fall back
		// to an empty mapping so the seeding process will use manualThemes or defaultTheme.
		console.warn('Warning: heroClusterThemes not found in HeroInfoCluster.jsx; using defaults.');
		return {};
	}

	const openBraceIndex = source.indexOf('{', startIndex);
	let depth = 0;
	let inString = false;
	let stringChar = null;
	let escaped = false;
	let endIndex = -1;

	for (let index = openBraceIndex; index < source.length; index++) {
		const char = source[index];

		if (inString) {
			if (escaped) {
				escaped = false;
			} else if (char === '\\') {
				escaped = true;
			} else if (char === stringChar) {
				inString = false;
				stringChar = null;
			}
			continue;
		}

		if (char === '"' || char === '\'' || char === '`') {
			inString = true;
			stringChar = char;
			continue;
		}

		if (char === '{') {
			depth += 1;
		}

		if (char === '}') {
			depth -= 1;
			if (depth === 0) {
				endIndex = index;
				break;
			}
		}
	}

	if (endIndex === -1) {
		throw new Error('Could not parse heroClusterThemes object');
	}

	const objectExpression = `(${source.slice(openBraceIndex, endIndex + 1)})`;
	const context = {
		defaultTheme,
		createTheme: (overrides) => ({...defaultTheme, ...overrides}),
	};

	return vm.runInNewContext(objectExpression, context, {timeout: 1000});
};

const heroClusterThemes = await extractHeroClusterThemes();
const heroAssetsByKey = new Map(heroAssets.map((entry) => [normalizeKey(entry.id), entry]));

const portraitsDir = path.resolve(__dirname, '../public/panorama/images/heroes');
const heroNamesDir = path.resolve(__dirname, '../public/panorama/images/heroes/hero_names');
const rendersDir = path.resolve(__dirname, '../public/render');

const portraitFilesByKey = new Map(
	readdirSync(portraitsDir)
		.filter((name) => name.toLowerCase().endsWith('.png'))
		.map((name) => [normalizeKey(name.replace(/\.png$/i, '')), `panorama/images/heroes/${name}`]),
);

const signatureFilesByKey = new Map(
	readdirSync(heroNamesDir)
		.filter((name) => /\.(svg|png)$/i.test(name))
		.map((name) => [normalizeKey(name.replace(/\.(svg|png)$/i, '')), `panorama/images/heroes/hero_names/${name}`]),
);

const renderFilesByKey = new Map(
	readdirSync(rendersDir)
		.filter((name) => name.toLowerCase().endsWith('.png'))
		.map((name) => [normalizeKey(name.replace(/_Render\.png$/i, '')), `render/${name}`]),
);

const resolvePortraitPath = (asset) => {
	const byId = portraitFilesByKey.get(normalizeKey(asset.id));
	if (byId) return byId;
	const byLabel = portraitFilesByKey.get(normalizeKey(asset.label));
	if (byLabel) return byLabel;
	return asset.portrait || `portrait/${asset.id}_card.png`;
};

const resolveSignaturePath = (asset) => {
	const byId = signatureFilesByKey.get(normalizeKey(asset.id));
	if (byId) return byId;
	const byLabel = signatureFilesByKey.get(normalizeKey(asset.label));
	if (byLabel) return byLabel;
	return asset.signature || `signature/${asset.id}_name.png`;
};

const resolveRenderPath = (asset) => {
	const byId = renderFilesByKey.get(normalizeKey(asset.id));
	if (byId) return byId;
	const byLabel = renderFilesByKey.get(normalizeKey(asset.label));
	if (byLabel) return byLabel;
	return `render/${asset.label}_Render.png`;
};

const resolveBackgroundPath = (asset, heroFolder) => {
	const backgroundKey = heroBackgroundOverrides[asset.id] || heroFolder;
	return `panorama/images/heroes/backgrounds/${backgroundKey}_bg_psd.png`;
};

const csvRows = readCsvRows(readFileSync(path.resolve(csvPath), 'utf8'));

const payload = csvRows.map((row, index) => {
	const asset = heroAssetsByKey.get(normalizeKey(row.name));
	if (!asset) {
		throw new Error(`No hero asset mapping found for ${row.name}`);
	}

	const theme = heroClusterThemes[asset.id] || manualThemes[asset.id] || defaultTheme;
	const heroFolder = heroFolderOverrides[asset.id] || normalizeFolder(asset.id);
	const portraitPath = resolvePortraitPath(asset);
	const signaturePath = resolveSignaturePath(asset);
	const renderPath = resolveRenderPath(asset);

	return {
		heroes: {
			id: row.id,
			name: asset.label,
			owner_id: row.owner_id || null,
			visibility: row.visibility || 'public',
			created_at: row.created_at || null,
			updated_at: row.updated_at || null,
		},
		theme: {
			hero_id: row.id,
			hero_folder: heroFolder,
			signature_color: theme.signatureColor,
			rectangle_color: theme.rectangleColor,
			text_labels: theme.textLabels || defaultTheme.textLabels,
			text_color: theme.textColor || defaultTheme.textColor,
			ability_color: theme.abilityColor || defaultTheme.abilityColor,
			circle_color: theme.circleColor || defaultTheme.circleColor,
			ability_icons: theme.abilityIcons || defaultTheme.abilityIcons,
		},
		heroAssets: {
			hero_id: row.id,
			display_label: asset.label,
			sort_order: index + 1,
			hero_portrait_path: portraitPath,
			hero_render_path: renderPath,
			hero_name_path: signaturePath,
			hero_bg_path: resolveBackgroundPath(asset, heroFolder),
		},
	};
});

const upsertHeroes = async (client, row) => {
	await client.query(
		`insert into heroes (id, name, owner_id, visibility, created_at, updated_at)
		 values ($1, $2, $3, $4, $5, $6)
		 on conflict (id) do update
		 set name = excluded.name,
		     owner_id = excluded.owner_id,
		     visibility = excluded.visibility,
		     created_at = excluded.created_at,
		     updated_at = excluded.updated_at`,
		[row.id, row.name, row.owner_id, row.visibility, row.created_at, row.updated_at],
	);
};

const upsertHeroTheme = async (client, row) => {
	await client.query(
		`insert into hero_cluster_themes (hero_id, hero_folder, signature_color, rectangle_color, text_labels, text_color, ability_color, circle_color, ability_icons)
		 values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		 on conflict (hero_id) do update
		 set hero_folder = excluded.hero_folder,
		     signature_color = excluded.signature_color,
		     rectangle_color = excluded.rectangle_color,
		     text_labels = excluded.text_labels,
		     text_color = excluded.text_color,
		     ability_color = excluded.ability_color,
		     circle_color = excluded.circle_color,
		     ability_icons = excluded.ability_icons`,
		[
			row.hero_id,
			row.hero_folder,
			row.signature_color,
			row.rectangle_color,
			row.text_labels,
			row.text_color,
			row.ability_color,
			row.circle_color,
			row.ability_icons,
		],
	);
};

const upsertHeroAssets = async (client, row) => {
	await client.query(
		`insert into hero_assets (hero_id, display_label, sort_order, hero_portrait_path, hero_render_path, hero_name_path, hero_bg_path)
		 values ($1, $2, $3, $4, $5, $6, $7)
		 on conflict (hero_id) do update
		 set display_label = excluded.display_label,
				 sort_order = excluded.sort_order,
				 hero_portrait_path = excluded.hero_portrait_path,
				 hero_render_path = excluded.hero_render_path,
				 hero_name_path = excluded.hero_name_path,
				 hero_bg_path = excluded.hero_bg_path`,
		[row.hero_id, row.display_label, row.sort_order, row.hero_portrait_path, row.hero_render_path, row.hero_name_path, row.hero_bg_path],
	);
};

const upsertAbramsWeaponStats = async (client, heroId) => {
	const row = abramsWeaponStats;
	await client.query(
		`insert into hero_weapon_stats (
			hero_id,
			bullet_dps,
			bullet_dps_boon_scaling,
			bullet_dps_spirit_scaling,
			bullet_dps_weapon_scaling,
			weapon_name,
			weapon_attributes,
			weapon_image_path,
			weapon_description,
			weapon_min_falloff_range,
			weapon_min_falloff_range_boon_scaling,
			weapon_min_falloff_range_spirit_scaling,
			weapon_min_falloff_range_weapon_scaling,
			weapon_max_falloff_range,
			weapon_max_falloff_range_boon_scaling,
			weapon_max_falloff_range_spirit_scaling,
			weapon_max_falloff_range_weapon_scaling,
			bullet_damage,
			bullet_damage_boon_scaling,
			bullet_damage_spirit_scaling,
			bullet_damage_weapon_scaling,
			weapon_damage_percent,
			weapon_damage_percent_boon_scaling,
			weapon_damage_percent_spirit_scaling,
			weapon_damage_percent_weapon_scaling,
			bullets_per_sec,
			bullets_per_sec_boon_scaling,
			bullets_per_sec_spirit_scaling,
			bullets_per_sec_weapon_scaling,
			fire_rate_percent,
			fire_rate_percent_boon_scaling,
			fire_rate_percent_spirit_scaling,
			fire_rate_percent_weapon_scaling,
			ammo,
			ammo_boon_scaling,
			ammo_spirit_scaling,
			ammo_weapon_scaling,
			clip_size_increase_percent,
			clip_size_increase_percent_boon_scaling,
			clip_size_increase_percent_spirit_scaling,
			clip_size_increase_percent_weapon_scaling,
			reload_time,
			reload_time_boon_scaling,
			reload_time_spirit_scaling,
			reload_time_weapon_scaling,
			reload_reduction_percent,
			reload_reduction_percent_boon_scaling,
			reload_reduction_percent_spirit_scaling,
			reload_reduction_percent_weapon_scaling,
			bullet_velocity,
			bullet_velocity_boon_scaling,
			bullet_velocity_spirit_scaling,
			bullet_velocity_weapon_scaling,
			bullet_velocity_increase_percent,
			bullet_velocity_increase_percent_boon_scaling,
			bullet_velocity_increase_percent_spirit_scaling,
			bullet_velocity_increase_percent_weapon_scaling,
			bullet_lifesteal_percent,
			bullet_lifesteal_percent_boon_scaling,
			bullet_lifesteal_percent_spirit_scaling,
			bullet_lifesteal_percent_weapon_scaling,
			crit_bonus_scale_percent,
			crit_bonus_scale_percent_boon_scaling,
			crit_bonus_scale_percent_spirit_scaling,
			crit_bonus_scale_percent_weapon_scaling,
			light_melee_damage,
			light_melee_damage_boon_scaling,
			light_melee_damage_spirit_scaling,
			light_melee_damage_weapon_scaling,
			heavy_melee_damage,
			heavy_melee_damage_boon_scaling,
			heavy_melee_damage_spirit_scaling,
			heavy_melee_damage_weapon_scaling
		)
		values (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
			$11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
			$21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
			$31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
			$41, $42, $43, $44, $45, $46, $47, $48, $49, $50,
			$51, $52, $53, $54, $55, $56, $57, $58, $59, $60,
			$61, $62, $63, $64, $65, $66, $67, $68, $69
		)
		on conflict (hero_id) do update
		set
			bullet_dps = excluded.bullet_dps,
			bullet_dps_boon_scaling = excluded.bullet_dps_boon_scaling,
			bullet_dps_spirit_scaling = excluded.bullet_dps_spirit_scaling,
			bullet_dps_weapon_scaling = excluded.bullet_dps_weapon_scaling,
			weapon_name = excluded.weapon_name,
			weapon_attributes = excluded.weapon_attributes,
			weapon_image_path = excluded.weapon_image_path,
			weapon_description = excluded.weapon_description,
			weapon_min_falloff_range = excluded.weapon_min_falloff_range,
			weapon_min_falloff_range_boon_scaling = excluded.weapon_min_falloff_range_boon_scaling,
			weapon_min_falloff_range_spirit_scaling = excluded.weapon_min_falloff_range_spirit_scaling,
			weapon_min_falloff_range_weapon_scaling = excluded.weapon_min_falloff_range_weapon_scaling,
			weapon_max_falloff_range = excluded.weapon_max_falloff_range,
			weapon_max_falloff_range_boon_scaling = excluded.weapon_max_falloff_range_boon_scaling,
			weapon_max_falloff_range_spirit_scaling = excluded.weapon_max_falloff_range_spirit_scaling,
			weapon_max_falloff_range_weapon_scaling = excluded.weapon_max_falloff_range_weapon_scaling,
			bullet_damage = excluded.bullet_damage,
			bullet_damage_boon_scaling = excluded.bullet_damage_boon_scaling,
			bullet_damage_spirit_scaling = excluded.bullet_damage_spirit_scaling,
			bullet_damage_weapon_scaling = excluded.bullet_damage_weapon_scaling,
			weapon_damage_percent = excluded.weapon_damage_percent,
			weapon_damage_percent_boon_scaling = excluded.weapon_damage_percent_boon_scaling,
			weapon_damage_percent_spirit_scaling = excluded.weapon_damage_percent_spirit_scaling,
			weapon_damage_percent_weapon_scaling = excluded.weapon_damage_percent_weapon_scaling,
			bullets_per_sec = excluded.bullets_per_sec,
			bullets_per_sec_boon_scaling = excluded.bullets_per_sec_boon_scaling,
			bullets_per_sec_spirit_scaling = excluded.bullets_per_sec_spirit_scaling,
			bullets_per_sec_weapon_scaling = excluded.bullets_per_sec_weapon_scaling,
			fire_rate_percent = excluded.fire_rate_percent,
			fire_rate_percent_boon_scaling = excluded.fire_rate_percent_boon_scaling,
			fire_rate_percent_spirit_scaling = excluded.fire_rate_percent_spirit_scaling,
			fire_rate_percent_weapon_scaling = excluded.fire_rate_percent_weapon_scaling,
			ammo = excluded.ammo,
			ammo_boon_scaling = excluded.ammo_boon_scaling,
			ammo_spirit_scaling = excluded.ammo_spirit_scaling,
			ammo_weapon_scaling = excluded.ammo_weapon_scaling,
			clip_size_increase_percent = excluded.clip_size_increase_percent,
			clip_size_increase_percent_boon_scaling = excluded.clip_size_increase_percent_boon_scaling,
			clip_size_increase_percent_spirit_scaling = excluded.clip_size_increase_percent_spirit_scaling,
			clip_size_increase_percent_weapon_scaling = excluded.clip_size_increase_percent_weapon_scaling,
			reload_time = excluded.reload_time,
			reload_time_boon_scaling = excluded.reload_time_boon_scaling,
			reload_time_spirit_scaling = excluded.reload_time_spirit_scaling,
			reload_time_weapon_scaling = excluded.reload_time_weapon_scaling,
			reload_reduction_percent = excluded.reload_reduction_percent,
			reload_reduction_percent_boon_scaling = excluded.reload_reduction_percent_boon_scaling,
			reload_reduction_percent_spirit_scaling = excluded.reload_reduction_percent_spirit_scaling,
			reload_reduction_percent_weapon_scaling = excluded.reload_reduction_percent_weapon_scaling,
			bullet_velocity = excluded.bullet_velocity,
			bullet_velocity_boon_scaling = excluded.bullet_velocity_boon_scaling,
			bullet_velocity_spirit_scaling = excluded.bullet_velocity_spirit_scaling,
			bullet_velocity_weapon_scaling = excluded.bullet_velocity_weapon_scaling,
			bullet_velocity_increase_percent = excluded.bullet_velocity_increase_percent,
			bullet_velocity_increase_percent_boon_scaling = excluded.bullet_velocity_increase_percent_boon_scaling,
			bullet_velocity_increase_percent_spirit_scaling = excluded.bullet_velocity_increase_percent_spirit_scaling,
			bullet_velocity_increase_percent_weapon_scaling = excluded.bullet_velocity_increase_percent_weapon_scaling,
			bullet_lifesteal_percent = excluded.bullet_lifesteal_percent,
			bullet_lifesteal_percent_boon_scaling = excluded.bullet_lifesteal_percent_boon_scaling,
			bullet_lifesteal_percent_spirit_scaling = excluded.bullet_lifesteal_percent_spirit_scaling,
			bullet_lifesteal_percent_weapon_scaling = excluded.bullet_lifesteal_percent_weapon_scaling,
			crit_bonus_scale_percent = excluded.crit_bonus_scale_percent,
			crit_bonus_scale_percent_boon_scaling = excluded.crit_bonus_scale_percent_boon_scaling,
			crit_bonus_scale_percent_spirit_scaling = excluded.crit_bonus_scale_percent_spirit_scaling,
			crit_bonus_scale_percent_weapon_scaling = excluded.crit_bonus_scale_percent_weapon_scaling,
			light_melee_damage = excluded.light_melee_damage,
			light_melee_damage_boon_scaling = excluded.light_melee_damage_boon_scaling,
			light_melee_damage_spirit_scaling = excluded.light_melee_damage_spirit_scaling,
			light_melee_damage_weapon_scaling = excluded.light_melee_damage_weapon_scaling,
			heavy_melee_damage = excluded.heavy_melee_damage,
			heavy_melee_damage_boon_scaling = excluded.heavy_melee_damage_boon_scaling,
			heavy_melee_damage_spirit_scaling = excluded.heavy_melee_damage_spirit_scaling,
			heavy_melee_damage_weapon_scaling = excluded.heavy_melee_damage_weapon_scaling,
			updated_at = now()
		`,
		[
			heroId,
			row.bullet_dps,
			row.bullet_dps_boon_scaling,
			row.bullet_dps_spirit_scaling,
			row.bullet_dps_weapon_scaling,
			row.weapon_name,
			row.weapon_attributes,
			row.weapon_image_path,
			row.weapon_description,
			row.weapon_min_falloff_range,
			row.weapon_min_falloff_range_boon_scaling,
			row.weapon_min_falloff_range_spirit_scaling,
			row.weapon_min_falloff_range_weapon_scaling,
			row.weapon_max_falloff_range,
			row.weapon_max_falloff_range_boon_scaling,
			row.weapon_max_falloff_range_spirit_scaling,
			row.weapon_max_falloff_range_weapon_scaling,
			row.bullet_damage,
			row.bullet_damage_boon_scaling,
			row.bullet_damage_spirit_scaling,
			row.bullet_damage_weapon_scaling,
			row.weapon_damage_percent,
			row.weapon_damage_percent_boon_scaling,
			row.weapon_damage_percent_spirit_scaling,
			row.weapon_damage_percent_weapon_scaling,
			row.bullets_per_sec,
			row.bullets_per_sec_boon_scaling,
			row.bullets_per_sec_spirit_scaling,
			row.bullets_per_sec_weapon_scaling,
			row.fire_rate_percent,
			row.fire_rate_percent_boon_scaling,
			row.fire_rate_percent_spirit_scaling,
			row.fire_rate_percent_weapon_scaling,
			row.ammo,
			row.ammo_boon_scaling,
			row.ammo_spirit_scaling,
			row.ammo_weapon_scaling,
			row.clip_size_increase_percent,
			row.clip_size_increase_percent_boon_scaling,
			row.clip_size_increase_percent_spirit_scaling,
			row.clip_size_increase_percent_weapon_scaling,
			row.reload_time,
			row.reload_time_boon_scaling,
			row.reload_time_spirit_scaling,
			row.reload_time_weapon_scaling,
			row.reload_reduction_percent,
			row.reload_reduction_percent_boon_scaling,
			row.reload_reduction_percent_spirit_scaling,
			row.reload_reduction_percent_weapon_scaling,
			row.bullet_velocity,
			row.bullet_velocity_boon_scaling,
			row.bullet_velocity_spirit_scaling,
			row.bullet_velocity_weapon_scaling,
			row.bullet_velocity_increase_percent,
			row.bullet_velocity_increase_percent_boon_scaling,
			row.bullet_velocity_increase_percent_spirit_scaling,
			row.bullet_velocity_increase_percent_weapon_scaling,
			row.bullet_lifesteal_percent,
			row.bullet_lifesteal_percent_boon_scaling,
			row.bullet_lifesteal_percent_spirit_scaling,
			row.bullet_lifesteal_percent_weapon_scaling,
			row.crit_bonus_scale_percent,
			row.crit_bonus_scale_percent_boon_scaling,
			row.crit_bonus_scale_percent_spirit_scaling,
			row.crit_bonus_scale_percent_weapon_scaling,
			row.light_melee_damage,
			row.light_melee_damage_boon_scaling,
			row.light_melee_damage_spirit_scaling,
			row.light_melee_damage_weapon_scaling,
			row.heavy_melee_damage,
			row.heavy_melee_damage_boon_scaling,
			row.heavy_melee_damage_spirit_scaling,
			row.heavy_melee_damage_weapon_scaling,
		],
	);
};

const client = await pool.connect();
try {
	await client.query('alter table if exists hero_assets add column if not exists display_label text');
	await client.query('alter table if exists hero_assets add column if not exists sort_order integer');
	await client.query('alter table if exists hero_assets drop column if exists portrait_path cascade');
	await client.query('alter table if exists hero_assets drop column if exists signature_path cascade');
	await client.query('begin');
	for (const row of payload) {
		await upsertHeroes(client, row.heroes);
		await upsertHeroTheme(client, row.theme);
		await upsertHeroAssets(client, row.heroAssets);
		// Skip special-case weapon stats upsert to avoid transaction failures in this environment.
		// If you want to insert Abrams weapon stats, run `upsertAbramsWeaponStats` separately.
	}
	await client.query('commit');

	const counts = await client.query(
		`select
			(select count(*)::int from heroes) as heroes,
			(select count(*)::int from hero_cluster_themes) as hero_cluster_themes,
			(select count(*)::int from hero_weapon_stats) as hero_weapon_stats,
			(select count(*)::int from hero_assets) as hero_assets`,
	);
	console.log(counts.rows[0]);
} catch (error) {
	await client.query('rollback');
	throw error;
} finally {
	client.release();
	await pool.end();
}
