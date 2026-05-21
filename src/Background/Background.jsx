import {observer} from 'mobx-react-lite';
import {useContext, useEffect, useState} from 'preact/hooks';

import {ConfigContext} from '/src/Common';
import {clearCache, fetchHero, saveCustomHero} from '/src/services/canonicalHeroService';
import {fetchHeroWeaponStats} from '/src/services/weaponStatsService';
import {fetchHeroVitalityStats} from '/src/services/vitalityStatsService';
import {fetchHeroSpiritStats} from '/src/services/spiritStatsService';
import { WeaponPanel, HeroStatsVitalityPanel as VitalityPanel, HeroStatsSpiritPanel } from '/src/WeaponPanel';
import { buildWeaponStatsArray } from '/src/WeaponPanel/weaponStatsMapper';
import { buildVitalityStatsArray } from '/src/WeaponPanel/vitalityStatsMapper';
import { buildTopSpiritStatsArray, buildSpiritPowerStat } from '/src/WeaponPanel/spiritStatsMapper';
import {useAuth} from '/src/Auth/useAuth';

import {backgroundOptions, defaultBackgroundId} from './backgrounds';
import {HeroInfoCluster} from './HeroInfoCluster';
import SidebarTabs from '/src/SidebarTabs/SidebarTabs.jsx';
import './Background.css';

const storageKey = 'deadmock.background.right';

const createInitialHeroDraft = () => ({
	signatureType: 'image',
	signatureValue: '',
	labels: ['TBD', 'TBD', 'TBD'],
	abilities: [null, null, null, null],
	signatureColor: '#ffefd6',
	rectangleColor: '#cccccc',
	textColor: '#ffefd6',
	circleColor: '#cccccc',
	iconColor: '#cccccc',
	heroFolder: 'custom_hero',
});


const Background = observer(({state, isEditable = true}) => {
	const config = useContext(ConfigContext);
	const baseUrl = config.baseUrl || '/';
	const {user, accessToken} = useAuth();
	const [heroClusterTheme, setHeroClusterTheme] = useState(null);
	const [selectedHero, setSelectedHero] = useState(null);
	const [weaponStatsRow, setWeaponStatsRow] = useState(null);
	const [vitalityStatsRow, setVitalityStatsRow] = useState(null);
	const [spiritStatsRow, setSpiritStatsRow] = useState(null);
	const [selectedSidebarTab, setSelectedSidebarTab] = useState('stats');
	const [heroDraft, setHeroDraft] = useState(() => createInitialHeroDraft());
	const [saveState, setSaveState] = useState('idle');
	const [saveError, setSaveError] = useState(null);
	const [selectedBackgroundId, setSelectedBackgroundId] = useState(() =>
		window.localStorage.getItem(storageKey) || defaultBackgroundId,
	);

	const selectedBackground = backgroundOptions.find((x) => x.id === selectedBackgroundId) || backgroundOptions[0];

	useEffect(() => {
		let cancelled = false;

		if (!state.selectedHeroId) {
			setSelectedHero(null);
			setHeroClusterTheme(null);
			setWeaponStatsRow(null);
			setVitalityStatsRow(null);
			setSpiritStatsRow(null);
			return;
		}

		fetchHero(state.selectedHeroId)
			.then((hero) => {
				if (cancelled) return;
				if (hero) {
					setSelectedHero(hero);
					setHeroClusterTheme(hero.theme);
					
					// Fetch stats in parallel
					Promise.all([
						fetchHeroWeaponStats(state.selectedHeroId),
						fetchHeroVitalityStats(state.selectedHeroId),
						fetchHeroSpiritStats(state.selectedHeroId),
					]).then(([ws, vs, ss]) => {
						if (cancelled) return;
						setWeaponStatsRow(ws);
						setVitalityStatsRow(vs);
						setSpiritStatsRow(ss);
					}).catch((err) => {
						console.error('Error fetching hero stats:', err);
						if (!cancelled) {
							setWeaponStatsRow(null);
							setVitalityStatsRow(null);
							setSpiritStatsRow(null);
						}
					});
				} else {
					setSelectedHero(null);
					setHeroClusterTheme(null);
					setWeaponStatsRow(null);
					setVitalityStatsRow(null);
					setSpiritStatsRow(null);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setSelectedHero(null);
					setHeroClusterTheme(null);
					setWeaponStatsRow(null);
					setVitalityStatsRow(null);
					setSpiritStatsRow(null);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [state.selectedHeroId]);

	useEffect(() => {
		if (!state.isCreatingHero) {
			return;
		}

		setHeroDraft(createInitialHeroDraft());
		setSaveState('idle');
		setSaveError(null);
	}, [state.isCreatingHero]);

	useEffect(() => {
		if (heroDraft) {
			setSaveError(null);
		}
	}, [heroDraft]);

	useEffect(() => {
		window.localStorage.setItem(storageKey, selectedBackground.id);
		document.documentElement.style.setProperty(
			'--mock-background-base-image',
			`url("${baseUrl}temp_background_environment_png2.png")`,
		);
		document.documentElement.style.setProperty(
			'--mock-background-side-image',
			selectedHero
				? `url("${baseUrl}${selectedHero.heroRender}")`
				: `url("${baseUrl}background/${selectedBackground.file}")`,
		);
	}, [baseUrl, selectedBackground, selectedHero]);

	const handleSaveCustomHero = async (visibility) => {
		if (!user || !accessToken) {
			setSaveError('Sign in to save custom heroes.');
			return;
		}

		if (!heroDraft.signatureValue || !String(heroDraft.signatureValue).trim()) {
			setSaveError('Pick a signature before saving.');
			return;
		}

		setSaveState('saving');
		setSaveError(null);

		try {
			const savedHero = await saveCustomHero({
				...heroDraft,
				visibility,
			}, accessToken);
			clearCache();
			state.setSelectedHero(savedHero.id);
			state.setIsCreatingHero(false);
		} catch (error) {
			setSaveError(error.message || 'Failed to save custom hero.');
		} finally {
			setSaveState('idle');
		}
	};

	const actionsDisabled = saveState === 'saving' || !user;

	return (
		<>
			<SidebarTabs
				defaultActiveId="stats"
				tabs={[
					{ id: 'weapon', label: 'Weapon', icon: `${baseUrl}icon/weapon.png` },
					{ id: 'vitality', label: 'Vitality', icon: `${baseUrl}icon/vitality.png` },
					{ id: 'signature', label: 'Signature', icon: `${baseUrl}icon/spirit.png` },
					{ id: 'stats', label: 'Stats', icon: `${baseUrl}icon/stat/placeholder.png` },
				]}
				onSelect={(id) => setSelectedSidebarTab(id)}
			/>
			{selectedSidebarTab === 'weapon' && (
				<div className="mock-weapon-stats-panel">
					{(() => {
						// If a hero is selected, show their weapon stats (read-only unless parent allows editing)
						if (selectedHero && weaponStatsRow) {
							const row = weaponStatsRow;
							const weaponStatsArray = buildWeaponStatsArray(row);

							return (
								<WeaponPanel
									weaponName={row.weapon_name || selectedHero.label}
									weaponDesc={row.weapon_description || ''}
									gunImageSrc={row.weapon_image_path ? `${baseUrl}${row.weapon_image_path.replace(/^\//, '')}` : `${baseUrl}panorama/images/heroes/guns/generic_gun_psd.png`}
									weaponAttributes={row.weapon_attributes || []}
									bulletDPS={row.bullet_dps}
									weaponMinRange={row.weapon_min_falloff_range}
									weaponMaxRange={row.weapon_max_falloff_range}
									weaponStats={weaponStatsArray}
									panelType="weapon"
									isEditable={false}
								/>
							);
						}

						// No hero selected -> show editable custom weapon panel
						return (
							<WeaponPanel
								weaponName="Custom Weapon"
								weaponDesc="Edit your custom weapon stats"
								gunImageSrc={`${baseUrl}panorama/images/heroes/guns/generic_gun_psd.png`}
								weaponAttributes={[]}
								weaponStats={[]}
								panelType="weapon"
								isEditable={true}
								onSaveStats={(stats) => console.log('Custom weapon saved', stats)}
							/>
						);
					})()}
				</div>
			)}
			{selectedSidebarTab === 'vitality' && (
				<div className="mock-weapon-stats-panel">
					<VitalityPanel stats={buildVitalityStatsArray(vitalityStatsRow || selectedHero)} />
				</div>
			)}
			{selectedSidebarTab === 'signature' && (
				<div className="mock-weapon-stats-panel">
					<HeroStatsSpiritPanel 
						stats={buildTopSpiritStatsArray(spiritStatsRow || selectedHero)} 
						spiritPowerStat={buildSpiritPowerStat(spiritStatsRow || selectedHero)}
					/>
				</div>
			)}
			{state.isCreatingHero && (
				<div className="mock-hero-info-cluster-centered">
					<HeroInfoCluster
						isEditable={true}
						theme={heroClusterTheme}
						baseUrl={baseUrl}
						onDraftChange={setHeroDraft}
					/>
				</div>
			)}
			{state.isCreatingHero && (
				<div className="mock-hero-actions-bar">
					<button
						type="button"
						className="mock-hero-save-button"
						onClick={() => handleSaveCustomHero('private')}
						disabled={actionsDisabled}
					>
						{saveState === 'saving' ? 'Saving...' : 'Save'}
					</button>
					<button
						type="button"
						className="mock-hero-publish-button"
						onClick={() => handleSaveCustomHero('public')}
						disabled={actionsDisabled}
					>
						{saveState === 'saving' ? 'Publishing...' : 'Publish'}
					</button>
					{!user && (
						<div className="mock-hero-save-hint">Sign in to save or publish heroes.</div>
					)}
					{saveError && <div className="mock-hero-save-error">{saveError}</div>}
				</div>
			)}
			{selectedHero && <HeroInfoCluster hero={selectedHero} theme={heroClusterTheme} baseUrl={baseUrl} />}
			{!selectedHero && (
				<div className="mock-background-picker">
					<label className="mock-background-picker-label" htmlFor="mock-background-picker-select">
						Right-side background
					</label>
					<select
						id="mock-background-picker-select"
						className="mock-background-picker-select"
						value={selectedBackgroundId}
						onChange={(ev) => setSelectedBackgroundId(ev.currentTarget.value)}
					>
						{backgroundOptions.map((option) => (
							<option value={option.id}>{option.label}</option>
						))}
					</select>
				</div>
			)}
		</>
	);
});

export {Background};