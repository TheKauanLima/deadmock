import 'dotenv/config';

import {readFileSync} from 'node:fs';
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

const heroFolderOverrides = {
	GreyTalon: 'grey_talon',
	LadyGeist: 'lady_geist',
	MoKrill: 'mo_and_krill',
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
		throw new Error('Could not find heroClusterThemes in HeroInfoCluster.jsx');
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

const csvRows = readCsvRows(readFileSync(path.resolve(csvPath), 'utf8'));

const payload = csvRows.map((row, index) => {
	const asset = heroAssetsByKey.get(normalizeKey(row.name));
	if (!asset) {
		throw new Error(`No hero asset mapping found for ${row.name}`);
	}

	const theme = heroClusterThemes[asset.id] || manualThemes[asset.id] || defaultTheme;
	const heroFolder = heroFolderOverrides[asset.id] || normalizeFolder(asset.id);

	return {
		heroes: {
			id: row.id,
			name: asset.label,
			owner_id: row.owner_id || null,
			visibility: row.visibility || 'public',
			created_at: row.created_at || null,
			updated_at: row.updated_at || null,
		},
		heroCatalog: {
			hero_id: row.id,
			display_label: asset.label,
			portrait_path: asset.portrait,
			render_path: asset.render,
			signature_path: asset.signature,
			sort_order: index + 1,
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

const upsertHeroCatalog = async (client, row) => {
	await client.query(
		`insert into hero_catalog (hero_id, display_label, portrait_path, render_path, signature_path, sort_order)
		 values ($1, $2, $3, $4, $5, $6)
		 on conflict (hero_id) do update
		 set display_label = excluded.display_label,
		     portrait_path = excluded.portrait_path,
		     render_path = excluded.render_path,
		     signature_path = excluded.signature_path,
		     sort_order = excluded.sort_order`,
		[row.hero_id, row.display_label, row.portrait_path, row.render_path, row.signature_path, row.sort_order],
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

const client = await pool.connect();
try {
	await client.query('begin');
	for (const row of payload) {
		await upsertHeroes(client, row.heroes);
		await upsertHeroCatalog(client, row.heroCatalog);
		await upsertHeroTheme(client, row.theme);
	}
	await client.query('commit');

	const counts = await client.query(
		`select
			(select count(*)::int from heroes) as heroes,
			(select count(*)::int from hero_catalog) as hero_catalog,
			(select count(*)::int from hero_cluster_themes) as hero_cluster_themes`,
	);
	console.log(counts.rows[0]);
} catch (error) {
	await client.query('rollback');
	throw error;
} finally {
	client.release();
	await pool.end();
}
