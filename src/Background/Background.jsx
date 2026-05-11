import {useContext, useEffect, useState} from 'preact/hooks';

import {ConfigContext} from '/src/Common';

import {backgroundOptions, defaultBackgroundId} from './backgrounds';
import './Background.css';

const storageKey = 'deadmock.background.right';

const Background = () => {
	const config = useContext(ConfigContext);
	const baseUrl = config.baseUrl || '/';
	const [selectedBackgroundId, setSelectedBackgroundId] = useState(() =>
		window.localStorage.getItem(storageKey) || defaultBackgroundId,
	);

	const selectedBackground = backgroundOptions.find((x) => x.id === selectedBackgroundId) || backgroundOptions[0];

	useEffect(() => {
		window.localStorage.setItem(storageKey, selectedBackground.id);
		document.documentElement.style.setProperty(
			'--mock-background-base-image',
			`url("${baseUrl}temp_background_environment_png2.png")`,
		);
		document.documentElement.style.setProperty(
			'--mock-background-side-image',
			`url("${baseUrl}background/${selectedBackground.file}")`,
		);
	}, [baseUrl, selectedBackground]);

	return (
		<div className="mock-background-picker">
			<label className="mock-background-picker-label" for="mock-background-picker-select">
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
	);
};

export {Background};