const defaultTheme = {
	signatureColor: '#ffefd6',
	rectangleColor: '#cccccc',
	textLabels: ['TBD', 'TBD', 'TBD'],
	textColor: '#ffefd6',
	abilityColor: '#cccccc',
	circleColor: '#cccccc',
	abilityIcons: [],
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

const HeroInfoCluster = ({hero, theme: overrideTheme, baseUrl = '/'}) => {
	const theme = {...defaultTheme, ...(overrideTheme || {})};
	const textLabels = theme.textLabels || defaultTheme.textLabels;
	const abilityIcons = (theme.abilityIcons || defaultTheme.abilityIcons).slice(0, 4);
	const heroFolder = theme.heroFolder || hero?.id?.toLowerCase().replace(/\s+/g, '_').replace(/&/g, 'and') || 'unknown';

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
								style={{'--mock-hero-icon-image': `url('${baseUrl}icon/hero/${heroFolder}/${icon}.png')`}}
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

export {HeroInfoCluster};
