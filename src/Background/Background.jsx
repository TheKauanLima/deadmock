import {observer} from 'mobx-react-lite';
import {useContext, useEffect, useState} from 'preact/hooks';

import {ConfigContext} from '/src/Common';
import {fetchHero} from '/src/services/canonicalHeroService';
import {fetchHeroWeaponStats} from '/src/services/weaponStatsService';
import {WeaponPanel} from '/src/WeaponPanel';
import {buildWeaponStatsArray} from '/src/WeaponPanel/weaponStatsMapper';
import VitalityPanel from '/src/WeaponPanel/HeroStatsVitalityPanel.jsx';
import {buildVitalityStatsArray} from '/src/WeaponPanel/vitalityStatsMapper';

import {backgroundOptions, defaultBackgroundId} from './backgrounds';
import {HeroInfoCluster} from './HeroInfoCluster';
import SidebarTabs from '/src/SidebarTabs/SidebarTabs.jsx';
import './Background.css';

const storageKey = 'deadmock.background.right';


const Background = observer(({state, isEditable = true}) => {
	const config = useContext(ConfigContext);
	const baseUrl = config.baseUrl || '/';
	const [heroClusterTheme, setHeroClusterTheme] = useState(null);
	const [selectedHero, setSelectedHero] = useState(null);
	const [weaponStatsRow, setWeaponStatsRow] = useState(null);
	const [selectedSidebarTab, setSelectedSidebarTab] = useState('stats');
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
			return;
		}

		fetchHero(state.selectedHeroId)
			.then((hero) => {
				if (cancelled) return;
				if (hero) {
					setSelectedHero(hero);
					setHeroClusterTheme(hero.theme);
					// fetch weapon stats row
					fetchHeroWeaponStats(state.selectedHeroId)
						.then((row) => {
							if (cancelled) return;
							setWeaponStatsRow(row);
						})
						.catch(() => {
							if (!cancelled) setWeaponStatsRow(null);
						});
				} else {
					setSelectedHero(null);
					setHeroClusterTheme(null);
					setWeaponStatsRow(null);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setSelectedHero(null);
					setHeroClusterTheme(null);
					setWeaponStatsRow(null);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [state.selectedHeroId]);

	useEffect(() => {
		window.localStorage.setItem(storageKey, selectedBackground.id);
		document.documentElement.style.setProperty(
			'--mock-background-base-image',
			`url("${baseUrl}temp_background_environment_png2.png")`,
		);
		document.documentElement.style.setProperty(
			'--mock-background-side-image',
			selectedHero
				? `url("${baseUrl}${selectedHero.render}")`
				: `url("${baseUrl}background/${selectedBackground.file}")`,
		);
	}, [baseUrl, selectedBackground, selectedHero]);

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
					<VitalityPanel stats={buildVitalityStatsArray(selectedHero)} />
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