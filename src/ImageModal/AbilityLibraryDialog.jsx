import {useCallback, useMemo, useState} from 'preact/hooks';

import {abilityLibraryGroups} from './abilityLibraryData';

const baseUrl = import.meta.env.BASE_URL || '/';

const resolveAbilityAssetUrl = (assetPath) => `${baseUrl}panorama/images/hud/abilities/${assetPath}`;

const AbilityIconButton = ({assetPath, label, onChoose}) => {
  const onClick = useCallback(() => onChoose(assetPath), [assetPath, onChoose]);

  return (
    <button type="button" className="mock-ability-library-icon-button" onClick={onClick} aria-label={label}>
      <img src={resolveAbilityAssetUrl(assetPath)} alt="" loading="lazy" className="mock-ability-library-icon-image" />
    </button>
  );
};

const AbilityLibraryDialog = ({image, onChange, onClose}) => {
  const [display, setDisplay] = useState(image);
  const groups = useMemo(() => abilityLibraryGroups, []);

  const onChoose = useCallback((id) => {
    setDisplay(id);
    onChange(id);
  }, [onChange]);

  return (
    <div className="mock-image-modal mock-ability-library-modal">
      <div className="mock-image-modal-header">
        <div className="mock-ability-library-title">Ability Library</div>
      </div>
      <div className="mock-image-modal-body">
        <div className="mock-left-scroll">
          <div className="mock-ability-library-list">
            {groups.map(({hero, icons}) => (
              <div key={hero} className="mock-ability-library-group">
                <div className="mock-ability-library-group-title">{hero}</div>
                <div className="mock-ability-library-group-icons">
                  {icons.map((assetPath) => (
                    <AbilityIconButton
                      key={assetPath}
                      assetPath={assetPath}
                      label={assetPath}
                      onChoose={onChoose}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mock-image-dialog-preview">
          <div className="mock-image-dialog-preview-icon">
            {display ? <img src={resolveAbilityAssetUrl(display)} alt="selected ability" className="mock-ability-library-preview-image" /> : <div className="mock-ability-library-preview-placeholder" />}
          </div>
        </div>
      </div>
      <div className="mock-image-modal-footer">
        <div className="mock-image-modal-cancel" onClick={onClose}>Cancel</div>
      </div>
    </div>
  );
};

export {AbilityLibraryDialog};