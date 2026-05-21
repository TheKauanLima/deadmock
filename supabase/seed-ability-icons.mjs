import 'dotenv/config';

import {pool} from '../server/db.js';
import {readdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Alias to canonical Hero ID mapping based on the hero aliases skill
const aliasToHeroId = {
	// Abrams
	abrams: 'Abrams',
	bull: 'Abrams',

	// Apollo
	fencer: 'Apollo',

	// Bebop
	bebop: 'Bebop',

	// Billy
	punkgoat: 'Billy',

	// Calico
	nano: 'Calico',

	// Celeste
	unicorn: 'Celeste',

	// Doorman
	doorman: 'Doorman',

	// Drifter
	drifter: 'Drifter',

	// Dynamo
	dynamo: 'Dynamo',
	sumo: 'Dynamo',

	// Graves
	necro: 'Graves',

	// Grey Talon
	grey_talon: 'GreyTalon',
	archer: 'GreyTalon',

	// Haze
	haze: 'Haze',

	// Holliday
	holliday: 'Holliday',
    astro: 'Holliday',

	// Infernus
	infernus: 'Infernus',
	inferno: 'Infernus',

	// Ivy
	ivy: 'Ivy',
	tengu: 'Ivy',

	// Kelvin
	kelvin: 'Kelvin',

	// Lady Geist
	geist: 'LadyGeist',
	lady_geist: 'LadyGeist',
	spectre: 'LadyGeist',

	// Lash
	lash: 'Lash',

	// McGinnis
	mcginnis: 'McGinnis',
	engineer: 'McGinnis',

	// Mina
	mina: 'Mina',
	vampirebat: 'Mina',

	// Mirage
	mirage: 'Mirage',

	// Mo & Krill
	krill: 'MoKrill',
	mo_and_krill: 'MoKrill',
	moandkrill: 'MoKrill',

	// Paige
	bookworm: 'Paige',

	// Paradox
	paradox: 'Paradox',
	chrono: 'Paradox',
	duo: 'Paradox',

	// Pocket
	pocket: 'Pocket',
	synth: 'Pocket',

	// Rem
	rem: 'Rem',
	familiar: 'Rem',

	// Seven
	seven: 'Seven',
	giga: 'Seven',
	gigawatt: 'Seven',

	// Shiv
	shiv: 'Shiv',

	// Silver
	silver: 'Silver',
	werewolf: 'Silver',

	// Sinclair
	sinclair: 'Sinclair',
	magician: 'Sinclair',

	// Venator
	venator: 'Venator',
	priest: 'Venator',

	// Victor
	victor: 'Victor',
	frank: 'Victor',

	// Vindicta
	vindicta: 'Vindicta',
	hornet: 'Vindicta',

	// Viscous
	viscous: 'Viscous',

	// Vyper
	vyper: 'Vyper',
	viper: 'Vyper',
	kali: 'Vyper',

	// Warden
	warden: 'Warden',

	// Wraith
	wraith: 'Wraith',

	// Yamato
	yamato: 'Yamato',
};

/**
 * Scans the ability icons directory and extracts icon references.
 * Returns an array of icon names with their file extensions for the given directory.
 */
const getAbilityIconsFromDirectory = (dirPath) => {
	try {
		const files = readdirSync(dirPath);
		const iconNumbers = [1, 2, 3, 4];
		const foundIcons = [];

		for (const num of iconNumbers) {
			// Check for PNG files first
			if (files.includes(`${num}.png`)) {
				foundIcons.push(`${num}.png`);
			}
			// Check for SVG files as fallback
			else if (files.includes(`${num}.svg`)) {
				foundIcons.push(`${num}.svg`);
			}
		}

		return foundIcons;
	} catch (error) {
		console.warn(`Could not read directory ${dirPath}:`, error.message);
		return [];
	}
};

/**
 * Scans all hero folders in the abilities directory and builds a map of
 * folder names to their ability icons, then maps them to canonical hero IDs.
 */
const buildHeroAbilityIconsFromFilesystem = () => {
	const abilitiesDir = path.join(__dirname, '..', 'public', 'panorama', 'images', 'hud', 'abilities');
	const heroAbilityIcons = {};

	try {
		const folders = readdirSync(abilitiesDir, { withFileTypes: true });

		for (const folder of folders) {
			if (!folder.isDirectory()) continue;

			const folderName = folder.name;
			const heroCanonicalId = aliasToHeroId[folderName];

			if (!heroCanonicalId) {
				console.warn(`No canonical hero mapping found for folder: "${folderName}"`);
				continue;
			}

			const folderPath = path.join(abilitiesDir, folderName);
			const icons = getAbilityIconsFromDirectory(folderPath);

			if (icons.length === 0) {
				console.warn(`No ability icons found for "${folderName}" (hero: "${heroCanonicalId}")`);
				continue;
			}

			// Store the icons, folder name, and canonical hero ID
			heroAbilityIcons[heroCanonicalId] = {
				folder: folderName,
				icons: icons,
			};

			console.log(`✓ Found ${icons.length} icons for ${heroCanonicalId} in folder "${folderName}"`);
		}
	} catch (error) {
		console.error('Error scanning abilities directory:', error);
	}

	return heroAbilityIcons;
};

const seedAbilityIcons = async () => {
	try {
		console.log('Scanning ability icons from filesystem...');
		const heroAbilityIcons = buildHeroAbilityIconsFromFilesystem();

		if (Object.keys(heroAbilityIcons).length === 0) {
			console.warn('No hero ability icons found in filesystem');
			process.exit(1);
		}

		console.log(`\nSeeding ability icons for ${Object.keys(heroAbilityIcons).length} heroes...`);

		for (const [heroCanonicalId, {folder, icons}] of Object.entries(heroAbilityIcons)) {
			// Get the hero ID from heroes table (query heroes directly)
			const heroResult = await pool.query(
				`SELECT id FROM heroes WHERE name = $1`,
				[heroCanonicalId],
			);

			if (heroResult.rows.length === 0) {
				console.warn(`Hero "${heroCanonicalId}" not found in heroes table`);
				continue;
			}

			const heroId = heroResult.rows[0].id;

			// Upsert the hero_cluster_themes table with ability icons and hero folder
			// Uses INSERT ... ON CONFLICT to create or update records as needed
			await pool.query(
				`INSERT INTO hero_cluster_themes (hero_id, hero_folder, ability_icons, created_at, updated_at)
				 VALUES ($1, $2, $3, now(), now())
				 ON CONFLICT (hero_id) DO UPDATE
				 SET ability_icons = $3, hero_folder = $2, updated_at = now()`,
				[heroId, folder, icons],
			);

			console.log(`✓ Seeded ${heroCanonicalId} with ${icons.length} ability icons from folder "${folder}"`);
		}

		console.log('\n✅ Ability icons seeded successfully!');
		process.exit(0);
	} catch (error) {
		console.error('Error seeding ability icons:', error);
		process.exit(1);
	}
};

seedAbilityIcons();
