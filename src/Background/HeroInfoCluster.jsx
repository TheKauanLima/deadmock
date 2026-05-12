const defaultTheme = {
	signatureColor: '#ffefd6',
	rectangleColor: '#cccccc',
	textLabels: ['TBD', 'TBD', 'TBD'],
	textColor: '#ffefd6',
	abilityColor: '#cccccc',
	circleColor: '#cccccc',
	abilityIcons: [],
};

const createTheme = (overrides) => ({...defaultTheme, ...overrides});

const heroClusterThemes = {
	Abrams: createTheme({
		signatureColor: '#ffefd6',
		rectangleColor: '#2192b1',
		textLabels: ['TANK', 'BRAWLER', 'BULL-HEADED'],
		textColor: '#ffefd6',
		abilityColor: '#061d27',
        circleColor: '#247fa3',
		abilityIcons: ['siphon_life', 'shoulder_charge', 'infernal_resilience', 'seismic_impact'],
	}),
	Apollo: createTheme({
		rectangleColor: '#ff3336',
		textLabels: ['FINESSE', 'MOBILITY', 'A CUT ABOVE'],
		textColor: '#ffefd6',
		abilityColor: '#3a0408',
        circleColor: '#ff3336',
		abilityIcons: ['disengaging_sigil', 'riposte', 'flawless_advance', 'itani_lo_sahn'],
	}),
	Bebop: createTheme({
        rectangleColor: '#a24635',
		textLabels: ['HOOK', 'BOMB', 'PUNCH'],
		textColor: '#ffefd6',
		abilityColor: '#210a01',
        circleColor: '#a24635',
		abilityIcons: ['exploding_uppercut', 'sticky_bomb', 'hook', 'hyper_beam'],
	}),
	Billy: createTheme({
        rectangleColor: '#d4ac0e',
		textLabels: ['PUNK', 'CHAOTIC', 'G.O.A.T.'],
		textColor: '#04090c',
		abilityColor: '#312303',
        circleColor: '#bf9b0a',
		abilityIcons: ['bashdown', 'rising_ram', 'blasted', 'chain_gang'],
	}),
	Calico: createTheme({
        rectangleColor: '#582799',
		textLabels: ['TRICKSY', 'SLIPPERY', 'BURST DAMAGE'],
		textColor: '#ffefd6',
		abilityColor: '#0f0321',
        circleColor: '#4e238c',
		abilityIcons: ['gloom_bombs', 'leaping_slash', 'ava', 'return_to_shadows'],
	}),
	Celeste: createTheme({
        rectangleColor: '#beaadf',
		textLabels: ['PERFORMER', 'DISRUPTIVE', 'DAZZLING'],
		textColor: '#0a0c09',
		abilityColor: '#272333',
        circleColor: '#aa97ce',
		abilityIcons: ['light_eater', 'dazzling_trick', 'radiant_daggers', 'shining_wonder'],
	}),
	Doorman: createTheme({
        rectangleColor: '#b6772a',
		textLabels: ['DISORIENTING', 'MAP CONTROL', 'MIND GAMES'],
		textColor: '#ffefd6',
		abilityColor: '#281503',
        circleColor: '#a86927',
		abilityIcons: ['call_bell', 'doorway', 'luggage_cart', 'hotel_guest'],
	}),
	Drifter: createTheme({
        rectangleColor: '#a02c2b',
		textLabels: ['STALKER', 'BLOODTHIRSTY', 'CRUEL'],
		textColor: '#ffefd6',
		abilityColor: '#210504',
        circleColor: '#8d2728',
		abilityIcons: ['rend', 'stalkers_mark', 'bloodscent', 'eternal_night'],
	}),
	Dynamo: createTheme({
        rectangleColor: '#d3b74a',
		textLabels: ['TEAMPLAY', 'INITIATOR', 'CLUTCH'],
		textColor: '#ffefd6',
		abilityColor: '#30280b',
        circleColor: '#bea43b',
		abilityIcons: ['kinetic_pulse', 'quantum_entanglement', 'rejuvenating_aurora', 'singularity'],
	}),
	Graves: createTheme({
        rectangleColor: '#d9f434',
		textLabels: ['MORBID', 'AREA DENIAL', 'NECROMANCER'],
		textColor: '#0e1013',
		abilityColor: '#323806',
        circleColor: '#c7db2d',
		abilityIcons: ['jar_of_dead', 'grasping_hands', 'essence_theft', 'borrowed_decree'],
	}),
	GreyTalon: createTheme({
        rectangleColor: '#5eb283',
		textLabels: ['PRECISION', 'HUNTER', 'AREA DENIAL'],
		textColor: '#ffefd6',
		abilityColor: '#0e281a',
        circleColor: '#559e79',
		abilityIcons: ['charged_shot', 'rain_of_arrows', 'spirit_snare', 'guided_owl'],
	}),
	Haze: createTheme({
        rectangleColor: '#ae6233',
		textLabels: ['ASSASSIN', 'STEALTHY', 'LETHAL'],
		textColor: '#ffefd6',
		abilityColor: '#281107',
        circleColor: '#9d572e',
		abilityIcons: ['sleep_dagger', 'smoke_bomb', 'fixation', 'bullet_dance'],
	}),
	Holliday: createTheme({
        rectangleColor: '#a45b1d',
		textLabels: ['CRACKSHOT', 'EXPLOSIVE', 'APPREHENDER'],
		textColor: '#ffefd6',
		abilityColor: '#220c08',
        circleColor: '#985017',
		abilityIcons: ['powder_keg', 'bounce_pad', 'crackshot', 'spirit_lasso'],
	}),
	Infernus: createTheme({
        rectangleColor: '#c83d24',
		textLabels: ['ARSONIST', 'EXPLOSIVE', 'BURN RUBBER'],
		textColor: '#ffefd6',
		abilityColor: '#2b0602',
        circleColor: '#b43723',
		abilityIcons: ['napalm', 'flame_dash', 'afterburn', 'concussive_combustion'],
	}),
	Ivy: createTheme({
        rectangleColor: '#9f8da5',
		textLabels: ['TEAM-UP', 'DISRUPTOR', 'ROCK SOLID'],
		textColor: '#ffefd6',
		abilityColor: '#221d26',
        circleColor: '#8e7e9b',
		abilityIcons: ['entangling_thorns', 'kudzu_connection', 'stone_form', 'air_drop'],
	}),
	Kelvin: createTheme({
        rectangleColor: '#75acb4',
		textLabels: ['PROTECTOR', 'EXPLORER', 'ICE COLD'],
		textColor: '#ffefd6',
		abilityColor: '#18242a',
        circleColor: '#699aaf',
		abilityIcons: ['frost_grenade', 'ice_path', 'arctic_beam', 'frozen_shelter'],
	}),
	LadyGeist: createTheme({
        rectangleColor: '#208642',
		textLabels: ['LIFESTEAL', 'SELF DAMAGE', 'FATALE'],
		textColor: '#ffefd6',
		abilityColor: '#011806',
        circleColor: '#1e763a',
		abilityIcons: ['essence_bomb', 'life_drain', 'malice', 'soul_exchange'],
	}),
	Lash: createTheme({
        rectangleColor: '#4076bd',
		textLabels: ['INITIATOR', 'HIGH FLYING', 'ARROGANT'],
		textColor: '#ffefd6',
		abilityColor: '#051529',
        circleColor: '#3869ab',
		abilityIcons: ['ground_strike', 'grapple', 'flog', 'death_slam'],
	}),
	McGinnis: createTheme({
        rectangleColor: '#22569f',
		textLabels: ['INVENTOR', 'SUPPORT', 'DISRUPTION'],
		textColor: '#ffefd6',
		abilityColor: '#010f1b',
        circleColor: '#204b8f',
		abilityIcons: ['mini_turret', 'medicinal_specter', 'spectral_wall', 'heavy_barrage'],
	}),
	Mina: createTheme({
        rectangleColor: '#230a0e',
		textLabels: ['HARASSER', 'NIMBLE', 'VEXING'],
		textColor: '#a61a19',
		abilityColor: '#290000',
        circleColor: '#99151b',
		abilityIcons: ['rake', 'sanguine_retreat', 'love_bites', 'nox_nostra'],
	}),
	Mirage: createTheme({
        rectangleColor: '#6b2f6b',
		textLabels: ['BODYGUARD', 'TRAVELLER', 'FOCUSED'],
		textColor: '#ffefd6',
		abilityColor: '#130412',
        circleColor: '#622960',
		abilityIcons: ['fire_scarabs', 'tornado', 'djinns_mark', 'traveler'],
	}),
	MoKrill: createTheme({
        rectangleColor: '#c68528',
		textLabels: ['TAG-TEAM', 'INITIATOR', 'BURROWER'],
		textColor: '#ffefd6',
		abilityColor: '#2d1a03',
        circleColor: '#b47422',
		abilityIcons: ['scorn', 'burrow', 'sand_blast', 'combo'],
	}),
	Paige: createTheme({
        rectangleColor: '#278f65',
		textLabels: ['HELPFUL', 'PROTECTOR', 'BOOKSMART'],
		textColor: '#ffefd6',
		abilityColor: '#051c10',
        circleColor: '#247f5c',
		abilityIcons: ['bookwyrm', 'plot_armor', 'captivating_read', 'rallying_charge'],
	}),
	Paradox: createTheme({
        rectangleColor: '#993a52',
		textLabels: ['CALCULATED', 'DISRUPTOR', 'TACTICIAN'],
		textColor: '#ffefd6',
		abilityColor: '#21060d',
        circleColor: '#8c314c',
		abilityIcons: ['pulse_grenade', 'time_wall', 'kinetic_carbine', 'paradoxical_swap',],
	}),
	Pocket: createTheme({
        rectangleColor: '#888618',
		textLabels: ['TRICKSTER', 'BURST DAMAGE', 'FROGS'],
		textColor: '#ffefd6',
		abilityColor: '#1a1c00',
        circleColor: '#7a761d',
		abilityIcons: ['barrage', 'flying_cloak', 'enchanters_satchel', 'affliction'],
	}),
	Rem: createTheme({
        rectangleColor: '#5581d1',
		textLabels: ['HELPFUL', 'TINY', 'zZzzZ'],
		textColor: '#0b1016',
		abilityColor: '#081736',
        circleColor: '#4b75bf',
		abilityIcons: ['pillow_toss', 'tag_along', 'lil_helpers', 'naptime'],
	}),
	Seven: createTheme({
        rectangleColor: '#cd8621',
		textLabels: ['HIGH VOLTAGE', 'MERCILESS', 'AREA DENIAL'],
		textColor: '#ffefd6',
		abilityColor: '#2e1c03',
        circleColor: '#ba7819',
		abilityIcons: ['lightning_ball', 'static_charge', 'power_surge', 'storm_cloud'],
	}),
	Shiv: createTheme({
        rectangleColor: '#e52b6a',
		textLabels: ['RAGE', 'BLEED', 'REPEAT'],
		textColor: '#ffefd6',
		abilityColor: '#310512',
        circleColor: '#d0255f',
		abilityIcons: ['serrated_knives', 'slice_and_dice', 'bloodletting', 'killing_blow'],
	}),
	Silver: createTheme({
        rectangleColor: '#c1bda3',
		textLabels: ['FERAL', 'HOT MESS', 'TRANSFORMATION'],
		textColor: '#090c0b',
		abilityColor: '#2a2a21',
        circleColor: '#c0be9f',
		abilityIcons: ['slam_fire', 'boot_kick', 'entangling_bola', 'lycan_curse'],
	}),
	Sinclair: createTheme({
        rectangleColor: '#6c6c6c',
		textLabels: ['TRICKSTER', 'COPYCAT', 'VERSATILE'],
		textColor: '#10110d',
		abilityColor: '#131313',
        circleColor: '#626063',
		abilityIcons: ['vexing_bolt', 'spectral_assistant', 'rabbit_hex', 'audience_participation'],
	}),
	Venator: createTheme({
        rectangleColor: '#bf3798',
		textLabels: ['DEVOUT', 'ARMS EXPERT', 'TACTICAL'],
		textColor: '#ffefd6',
		abilityColor: '#28031f',
        circleColor: '#ad2f90',
		abilityIcons: ['consecrating_grenade', 'gutshot', 'hex_lined_snap_trap', 'ira_domini'],
	}),
	Victor: createTheme({
        rectangleColor: '#678b71',
		textLabels: ['YOU', "CAN'T", 'KILL ME'],
		textColor: '#ffefd6',
		abilityColor: '#131c13',
        circleColor: '#5c7e65',
		abilityIcons: ['pain_battery', 'jumpstart', 'aura_of_suffering', 'shocking_reanimation'],
	}),
	Vindicta: createTheme({
		rectangleColor: '#a5c7e5',
		textLabels: ['SNIPER', 'SOARING', 'ONE SHOT KILL'],
		textColor: '#0c1009',
		abilityColor: '#1f2b30',
        circleColor: '#94b2d3',
		abilityIcons: ['stake', 'flight', 'crow_familiar', 'assassinate'],
	}),
	Viscous: createTheme({
		rectangleColor: '#319928',
		textLabels: ['EVASIVE', 'DISRUPTOR', 'GOOEY'],
		textColor: '#ffefd6',
		abilityColor: '#051d03',
        circleColor: '#2d8723',
		abilityIcons: ['splatter', 'the_cube', 'puddle_punch', 'goo_ball'],
	}),
	Vyper: createTheme({
		rectangleColor: '#a7ad03',
		textLabels: ['GUNNER', 'SLIPPERY', 'RAT-A-TAT'],
		textColor: '#0a1309',
		abilityColor: '#232501',
        circleColor: '#979b00',
		abilityIcons: ['screwjab_dagger', 'lethal_venom', 'slither', 'petrifying_bola'],
	}),
	Warden: createTheme({
		rectangleColor: '#5068a6',
		textLabels: ['INITIATOR', 'FEARLESS', 'ONE MAN ARMY'],
		textColor: '#ffefd6',
		abilityColor: '#0a1220',
        circleColor: '#465e92',
		abilityIcons: ['alchemical_flask', 'willpower', 'binding_word', 'last_stand'],
	}),
	Wraith: createTheme({
		rectangleColor: '#915177',
		textLabels: ['DUELIST', 'ISOLATOR', 'TELEKINETIC'],
		textColor: '#ffefd6',
		abilityColor: '#1e0b17',
        circleColor: '#87466f',
		abilityIcons: ['card_trick', 'project_mind', 'full_auto', 'telekinesis'],
	}),
	Yamato: createTheme({
		rectangleColor: '#62568b',
		textLabels: ['RELENTLESS', 'ACROBATICS', 'PURSUER'],
		textColor: '#ffefd6',
		abilityColor: '#0f0e1c',
        circleColor: '#5a4e7e',
		abilityIcons: ['power_slash', 'flying_strike', 'crimson_slash', 'shadow_transformation'],
	}),
};

const normalizeFolder = (id) => id.toLowerCase().replace(/\s+/g, '_').replace(/&/g, 'and');

const heroFolderOverrides = {
	GreyTalon: 'grey_talon',
	LadyGeist: 'lady_geist',
	MoKrill: 'mo_and_krill',
};

const getHeroFolder = (heroId, fallback) => heroFolderOverrides[heroId] || fallback || normalizeFolder(heroId || '');

const getHeroClusterTheme = (selectedHero) => {
	const base = heroClusterThemes[selectedHero.id] || defaultTheme;
	return {
		...base,
		heroFolder: getHeroFolder(selectedHero.id, base.heroFolder),
		textLabels: base.textLabels || defaultTheme.textLabels,
		abilityIcons: base.abilityIcons || defaultTheme.abilityIcons,
	};
};

const hashText = (text) => {
	let hash = 0;
	for (let i = 0; i < text.length; i++) {
		hash = (hash << 5) - hash + text.charCodeAt(i);
		hash |= 0;
	}
	return Math.abs(hash);
};

const getRectRotation = (heroId, label, index) => {
	const value = hashText(`${heroId}:${label}:${index}`) % 21;
	return value - 10;
};

const HeroInfoCluster = ({hero, baseUrl = '/'}) => {
	const theme = getHeroClusterTheme(hero || {});
	const textLabels = theme.textLabels || [];
	const abilityIcons = (theme.abilityIcons || []).slice(0, 4);

	return (
		<div
			className="mock-hero-info-cluster"
			style={{
				'--mock-hero-accent': theme.circleColor,
				'--mock-hero-signature-color': theme.signatureColor,
				'--mock-hero-text-color': theme.textColor,
				'--mock-hero-rectangle-color': theme.rectangleColor,
				'--mock-hero-ability-color': theme.abilityColor,
				'--mock-hero-circle-color': theme.circleColor,
				'--mock-hero-icon-color': theme.abilityColor,
			}}
		>
			{hero?.signature && (
				<div
					className="mock-hero-signature"
					style={{'--mock-hero-signature-image': `url('${baseUrl}${hero.signature}')`}}
					aria-label={`${hero.label} signature`}
				/>
			)}
			<div className="mock-hero-info-rectangles">
				{textLabels.map((label, index) => (
					<div
						key={`${hero?.id || 'unknown'}-${label}-${index}`}
						className="mock-hero-info-rectangle"
						style={{'--mock-rect-rotation': `${getRectRotation(hero?.id || 'unknown', label, index)}deg`}}
					>
						<span>{label}</span>
					</div>
				))}
			</div>
			<div className="mock-hero-info-circles">
				{abilityIcons.length
					? abilityIcons.map((icon, index) => (
						<div key={`${hero?.id || 'unknown'}-${icon}-${index}`} className="mock-hero-info-circle">
							<div
								className="mock-hero-info-circle-image"
								style={{'--mock-hero-icon-image': `url('${baseUrl}icon/hero/${theme.heroFolder}/${icon}.png')`}}
							/>
						</div>
					))
					: [0, 1, 2, 3].map((n) => (
						<div key={`placeholder-${n}`} className="mock-hero-info-circle">
							<div className="mock-hero-info-circle-image" />
						</div>
					))}
			</div>
		</div>
	);
};

export {HeroInfoCluster, heroClusterThemes};
