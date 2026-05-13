import {observer} from 'mobx-react-lite';
import {useContext, useEffect, useState} from 'preact/hooks';

import {ConfigContext} from '/src/Common';
import {fetchHero} from '/src/services/canonicalHeroService';
import {WeaponPanel} from '/src/WeaponPanel';

import {backgroundOptions, defaultBackgroundId} from './backgrounds';
import {HeroInfoCluster} from './HeroInfoCluster';
import SidebarTabs from '/src/SidebarTabs/SidebarTabs.jsx';
import './Background.css';

const storageKey = 'deadmock.background.right';


const Background = observer(({state}) => {
	const config = useContext(ConfigContext);
	const baseUrl = config.baseUrl || '/';
	const [heroClusterTheme, setHeroClusterTheme] = useState(null);
	const [selectedHero, setSelectedHero] = useState(null);
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
			return;
		}

		fetchHero(state.selectedHeroId)
			.then((hero) => {
				if (!cancelled) {
					if (hero) {
						setSelectedHero(hero);
						setHeroClusterTheme(hero.theme);
					} else {
						setSelectedHero(null);
						setHeroClusterTheme(null);
					}
				}
			})
			.catch(() => {
				if (!cancelled) {
					setSelectedHero(null);
					setHeroClusterTheme(null);
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
					{ id: 'portrait', label: 'Portrait', icon: `${baseUrl}icon/vitality.png` },
					{ id: 'signature', label: 'Signature', icon: `${baseUrl}icon/spirit.png` },
					{ id: 'stats', label: 'Stats', icon: `${baseUrl}icon/stat/placeholder.png` },
				]}
				onSelect={(id) => setSelectedSidebarTab(id)}
			/>
			{selectedSidebarTab === 'weapon' && (
				<div className="mock-weapon-stats-panel">
					<WeaponPanel
						weaponName="Plasma Rifle"
						weaponDesc="A high-tech energy weapon with controlled recoil and strong range."
						secondaryWeaponDesc="Alt fire: Charged burst"
						gunImageSrc={`${baseUrl}panorama/images/heroes/guns/generic_gun_psd.png`}
						weaponAttributes={['Full Auto', 'Hitscan']}
						bulletDPS={105}
						weaponMinRange={10}
						weaponMaxRange={40}
						initialStats={[
							{ label: 'Damage', value: 42 },
							{ label: 'Fire Rate', value: 2.5, hasScaling: true },
							{ label: 'Crit Chance', value: 0, isZero: true },
						]}
						secondaryStats={[
							{ label: 'Charge Time', value: '0.8s' },
							{ label: 'Burst Count', value: 3 },
						]}
						otherStats={[
							{ label: 'Reload', value: '1.6s' },
							{ label: 'Ammo', value: 24 },
						]}
						showSecondaryWeapon={true}
						panelType="weapon"
					/>
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