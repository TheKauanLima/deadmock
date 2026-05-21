import {useEffect, useRef, useState} from 'preact/hooks';
import {ImageModalTrigger} from '/src/ImageModal';
import {EditableText} from '/src/Text';

const defaultTheme = {
  signatureColor: '#ffefd6',
  rectangleColor: '#cccccc',
  textLabels:     ['TBD', 'TBD', 'TBD'],
  textColor:      '#ffefd6',
  abilityColor:   '#cccccc',
  circleColor:    '#cccccc',
  iconColor:      '#cccccc',
  abilityIcons:   [],
};

const textSignaturePrefix = 'text:';

const decodeSignatureSource = (value) => {
  const source = String(value || '').trim();
  if (source.startsWith(textSignaturePrefix)) {
    return {
      type: 'text',
      value: source.slice(textSignaturePrefix.length),
    };
  }

  return {
    type: 'image',
    value: source,
  };
};

const slugifyFolder = (value) => String(value || 'custom_hero')
  .replace(/\.[^.]+$/, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '') || 'custom_hero';

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

const resolveAbilityIconAssetPath = (icon, heroFolder) => {
  const value = String(icon || '').trim();
  if (!value) {
    return '';
  }

  if (value.includes('/')) {
    return (/\.[a-z0-9]+$/i).test(value) ? value : `${value}.png`;
  }

  return `${heroFolder}/${(/\.[a-z0-9]+$/i).test(value) ? value : `${value}.png`}`;
};

const buildAbilityIconUrl = (icon, heroFolder, baseUrl) => {
  const assetPath = resolveAbilityIconAssetPath(icon, heroFolder);
  return assetPath ? `${baseUrl}panorama/images/hud/abilities/${assetPath}` : '';
};

const clampByte = (value) => Math.min(255, Math.max(0, Number(value) || 0));

const parseRgb = (value) => {
  const match = String(value || '').trim().match(/^rgba?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})/i);
  if (!match) {
    return null;
  }

  return {
    r: clampByte(match[1]),
    g: clampByte(match[2]),
    b: clampByte(match[3]),
  };
};

const parseHex = (value) => {
  const match = String(value || '').trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) {
    return null;
  }

  const hex = match[1];
  if (hex.length === 3) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }

  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
};

const parseColor = (value, fallback) => parseRgb(value) || parseHex(value) || parseRgb(fallback) || parseHex(fallback) || {r: 255, g: 255, b: 255};

const rgbToHex = ({r, g, b}) => `#${[r, g, b].map((x) => clampByte(x).toString(16).padStart(2, '0')).join('')}`;

const ColorSwatchButton = ({label, value, onMouseDown}) => (
  <button
    aria-label={label}
    className="mock-hero-color-swatch-button"
    title={label}
    type="button"
    onMouseDown={onMouseDown}
  >
    <span className="mock-hero-color-swatch" style={{backgroundColor: value}} />
  </button>
);

const HeroInfoCluster = ({hero, theme: overrideTheme, baseUrl = '/', isEditable = false, centered = false, onDraftChange}) => {
  const theme = {...defaultTheme, ...overrideTheme || {}};
  const initialLabels = theme.textLabels || defaultTheme.textLabels;
  const initialAbilities = (theme.abilityIcons || defaultTheme.abilityIcons).slice(0, 4);

  const signatureColorInputRef = useRef(null);
  const rectangleColorInputRef = useRef(null);
  const textColorInputRef = useRef(null);
  const circleColorInputRef = useRef(null);
  const iconColorInputRef = useRef(null);

  const resolvedSignature = decodeSignatureSource(hero?.heroName);

  const [signatureType, setSignatureType] = useState(resolvedSignature.type);
  const [signatureValue, setSignatureValue] = useState(resolvedSignature.value);
  const [labels, setLabels] = useState(initialLabels.slice(0, 3));
  const [abilities, setAbilities] = useState(initialAbilities.concat([null, null, null, null]).slice(0, 4));
  const [activeAbilityIndex, setActiveAbilityIndex] = useState(null);
  const [activeColorChoiceIndex, setActiveColorChoiceIndex] = useState(null);
  const [signatureColor, setSignatureColor] = useState(theme.signatureColor || defaultTheme.signatureColor);
  const [rectangleColor, setRectangleColor] = useState(theme.rectangleColor || defaultTheme.rectangleColor);
  const [textColor, setTextColor] = useState(theme.textColor || defaultTheme.textColor);
  const [circleColor, setCircleColor] = useState(theme.circleColor || defaultTheme.circleColor);
  const [iconColor, setIconColor] = useState(theme.iconColor || theme.abilityColor || defaultTheme.iconColor);

  const heroFolder = theme.heroFolder || hero?.id?.toLowerCase().replace(/\s+/g, '_').replace(/&/g, 'and') || slugifyFolder(signatureType === 'text' ? signatureValue : signatureValue.split('/').pop());

  const onChangeLabel = (index, value) => {
    const next = labels.slice();
    next[index] = value;
    setLabels(next);
  };

  const onChangeAbility = (index, value) => {
    const next = abilities.slice();
    next[index] = value;
    setAbilities(next);
  };

  useEffect(() => {
    if (!onDraftChange) {
      return;
    }

    onDraftChange({
      signatureType,
      signatureValue,
      labels,
      abilities,
      signatureColor,
      rectangleColor,
      textColor,
      circleColor,
      iconColor,
      heroFolder,
    });
  }, [abilities, circleColor, heroFolder, iconColor, labels, onDraftChange, rectangleColor, signatureColor, signatureType, signatureValue, textColor]);

  const getColorInputValue = (value, fallback) => rgbToHex(parseColor(value, fallback));

  const openColorPicker = (targetKey, inputRef) => (ev) => {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }

    inputRef.current?.click();
  };

  const rootClass = `mock-hero-info-cluster${centered ? ' mock-hero-info-cluster-centered' : ''}`;

  const handleRectangleMouseDown = (ev) => {
    if (ev.target !== ev.currentTarget) {
      return;
    }

    openColorPicker('rectangle', rectangleColorInputRef)(ev);
  };

  const handleCircleClick = (index) => (ev) => {
    if (ev.target !== ev.currentTarget) {
      return;
    }

    ev.preventDefault();
    ev.stopPropagation();
    setActiveColorChoiceIndex((current) => current === index ? null : index);
  };

  const handleCircleColorChoiceClick = (index, choice) => (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    setActiveColorChoiceIndex(null);

    if (choice === 'icon') {
      iconColorInputRef.current?.click();
      return;
    }

    circleColorInputRef.current?.click();
  };

  const closeCircleColorChoice = () => setActiveColorChoiceIndex(null);

  const handleIconMouseDown = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    iconColorInputRef.current?.click();
  };

  const displaySignature = isEditable ? {type: signatureType, value: signatureValue} : resolvedSignature;

  return (
    <div
      className={rootClass}
      style={{
        '--mock-hero-accent':          circleColor,
        '--mock-hero-signature-color': signatureColor,
        '--mock-hero-text-color':      textColor,
        '--mock-hero-rectangle-color': rectangleColor,
        '--mock-hero-circle-color':    circleColor,
        '--mock-hero-icon-color':      iconColor,
        'pointerEvents':                 isEditable ? 'auto' : 'none',
      }}
    >
      {isEditable && (
        <>
          <input
            ref={signatureColorInputRef}
            className="mock-hero-hidden-color-input"
            type="color"
            value={getColorInputValue(signatureColor, defaultTheme.signatureColor)}
            onInput={(ev) => setSignatureColor(ev.currentTarget.value)}
          />
          <input
            ref={rectangleColorInputRef}
            className="mock-hero-hidden-color-input"
            type="color"
            value={getColorInputValue(rectangleColor, defaultTheme.rectangleColor)}
            onInput={(ev) => setRectangleColor(ev.currentTarget.value)}
          />
          <input
            ref={textColorInputRef}
            className="mock-hero-hidden-color-input"
            type="color"
            value={getColorInputValue(textColor, defaultTheme.textColor)}
            onInput={(ev) => setTextColor(ev.currentTarget.value)}
          />
          <input
            ref={circleColorInputRef}
            className="mock-hero-hidden-color-input"
            type="color"
            value={getColorInputValue(circleColor, defaultTheme.circleColor)}
            onInput={(ev) => setCircleColor(ev.currentTarget.value)}
          />
          <input
            ref={iconColorInputRef}
            className="mock-hero-hidden-color-input"
            type="color"
            value={getColorInputValue(iconColor, defaultTheme.iconColor)}
            onInput={(ev) => setIconColor(ev.currentTarget.value)}
          />
        </>
      )}

      <div className="mock-hero-signature-slot">
        {isEditable && (
          <div className="mock-hero-signature-toggle" style={{pointerEvents: 'auto'}}>
            <button
              className={`mock-hero-signature-mode ${signatureType === 'image' ? 'active' : ''}`}
              type="button"
              onClick={() => setSignatureType('image')}
            >
              Image
            </button>
            <button
              className={`mock-hero-signature-mode ${signatureType === 'text' ? 'active' : ''}`}
              type="button"
              onClick={() => setSignatureType('text')}
            >
              Text
            </button>
          </div>
        )}

        {displaySignature.type === 'image' ?
          isEditable ? (
            <div className="mock-hero-signature-image-stack">
              <div
                aria-label={`${hero?.label || 'New hero'} signature`}
                className={`mock-hero-signature-image mock-hero-signature-image-editable ${displaySignature.value ? 'has-image' : ''}`}
                style={{
                  '--mock-hero-signature-image': displaySignature.value ? `url('${baseUrl}${displaySignature.value}')` : '',
                  'pointerEvents':                 'auto',
                  'cursor':                        'pointer',
                }}
                onMouseDown={openColorPicker('signature', signatureColorInputRef)}
              />
              <ImageModalTrigger image={displaySignature.value} type="portrait" onChange={(v) => setSignatureValue(v)}>
                <button aria-label="Choose signature image" className="mock-hero-signature-image-button" type="button">
                  <span className="mock-hero-signature-image-button-icon" />
                </button>
              </ImageModalTrigger>
            </div>
          ) :
            displaySignature.value && (
              <div
                aria-label={`${hero.label} signature`}
                className={`mock-hero-signature-image ${displaySignature.value ? 'has-image' : ''}`}
                style={{
                  '--mock-hero-signature-image': `url('${baseUrl}${displaySignature.value}')`,
                }}
              />
            ) :

          (
            <div className="mock-hero-signature-text">
              {isEditable ? (
                <>
                  <EditableText onChange={(v) => setSignatureValue(v)}>{signatureValue || 'Signature'}</EditableText>
                  <ColorSwatchButton
                    label="Pick signature color"
                    value={signatureColor}
                    onMouseDown={openColorPicker('signature', signatureColorInputRef)}
                  />
                </>
              ) :
                <span>{displaySignature.value}</span>}
            </div>
          )}
      </div>

      <div className="mock-hero-info-rectangles">
        {labels.map((label, index) => (
          <div
            key={`${hero?.id || 'unknown'}-${label}-${index}`}
            className={`mock-hero-info-rectangle${isEditable ? ' mock-hero-info-rectangle-editable' : ''}`}
            style={{
              '--mock-rect-rotation': `${getRectRotation(hero?.id || 'unknown', label, index)}deg`,
              'background':             rectangleColor,
              'color':                  textColor,
            }}
            onMouseDown={isEditable ? handleRectangleMouseDown : undefined}
          >
            {isEditable ? (
              <>
                <EditableText onChange={(v) => onChangeLabel(index, v)}>{label}</EditableText>
                <ColorSwatchButton
                  label="Pick rectangle text color"
                  value={textColor}
                  onMouseDown={openColorPicker('text', textColorInputRef)}
                />
              </>
            ) :
              <span>{label}</span>}
          </div>
        ))}
      </div>

      <div className="mock-hero-info-circles" onMouseDown={isEditable ? closeCircleColorChoice : undefined}>
        {abilities.length ?
          abilities.map((icon, index) => (
            <div
              key={`${hero?.id || 'unknown'}-${icon}-${index}`}
              className={`mock-hero-info-circle-stack ${activeAbilityIndex === index ? 'mock-hero-info-circle-stack-active' : ''}`}
              onMouseDown={(ev) => ev.stopPropagation()}
            >
              <button
                aria-label={`Pick circle color for ability ${index + 1}`}
                className="mock-hero-info-circle mock-hero-info-circle-button"
                style={{backgroundColor: circleColor}}
                type="button"
                onClick={isEditable ? handleCircleClick(index) : undefined}
              >
                <div
                  className="mock-hero-info-circle-image"
                  style={{
                    '--mock-hero-icon-image': icon ? `url('${buildAbilityIconUrl(icon, heroFolder, baseUrl)}')` : '',
                    'backgroundColor':          iconColor,
                  }}
                  onMouseDown={isEditable ? handleIconMouseDown : undefined}
                />
              </button>

              {isEditable && activeColorChoiceIndex === index && (
                <div className="mock-hero-circle-color-chooser" role="menu" aria-label="Pick color target">
                  <button
                    type="button"
                    className="mock-hero-circle-color-choice"
                    onMouseDown={handleCircleColorChoiceClick(index, 'circle')}
                  >
                    Circle color
                  </button>
                  <button
                    type="button"
                    className="mock-hero-circle-color-choice"
                    onMouseDown={handleCircleColorChoiceClick(index, 'icon')}
                  >
                    Icon color
                  </button>
                </div>
              )}

              {isEditable && (
                <ImageModalTrigger
                  dropType="icon"
                  image={icon}
                  modalType="ability-library"
                  type="icon"
                  onChange={(v) => {
                    onChangeAbility(index, v);
                    setActiveAbilityIndex(null);
                  }}
                >
                  <button
                    aria-label="Choose ability icon from library"
                    className="mock-ability-prompt-button"
                    type="button"
                    onClick={() => setActiveAbilityIndex(index)}
                  >
                    <span className="mock-ability-prompt-button-icon" />
                  </button>
                </ImageModalTrigger>
              )}
            </div>
          )) :
          [0, 1, 2, 3].map((n) => (
            <div key={`placeholder-${n}`} className="mock-hero-info-circle-stack">
              <div className="mock-hero-info-circle mock-hero-info-circle-button">
                <div className="mock-hero-info-circle-image" />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export {HeroInfoCluster};
