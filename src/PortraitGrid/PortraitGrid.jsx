import {observer} from 'mobx-react-lite';
import {useEffect, useState} from 'react';

import {heroAssets} from '/src/Hero/heroes';
import {fetchAllHeroes} from '/src/services/canonicalHeroService';

import './PortraitGrid.css';

const PortraitGrid = observer(({state}) => {
  const cols = 8;
  const rows = 5;
  const total = cols * rows;
  const plusIndex = heroAssets.length;
  const cells = Array.from({length: total}, (_, i) => i);
  const [assetsById, setAssetsById] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const map = {};
      const heroes = await fetchAllHeroes();
      for (const hero of heroes) {
        map[hero.id] = hero;
      }
      if (mounted) setAssetsById(map);
    })();
    return () => { mounted = false; };
  }, []);

  if (state.isCreatingHero) return null;

  return (
    <div className="portrait-grid">
      {cells.map((n) => {
        const hero = heroAssets[n];
        const isPlus = n === plusIndex;
        const isLast = n === total - 1; // bottom-right

        if (isLast) {
          return <div key={n} className="portrait-cell portrait-empty" />;
        }

        if (isPlus) {
          return (
            <button
              key={n}
              type="button"
              className="portrait-cell portrait-plus portrait-button"
              onClick={() => {
                state.clearSelectedHero();
                state.setIsCreatingHero(true);
              }}
              aria-label="Create new hero"
              title="Create new hero"
            >
              <span className="portrait-plus-sign">+</span>
            </button>
          );
        }

        return (
          <button
            key={n}
            type="button"
            className={`portrait-cell portrait-filled portrait-button ${state.selectedHeroId === hero.id ? 'portrait-selected' : ''}`}
            onClick={() => state.setSelectedHero(hero.id)}
            aria-label={`Show ${hero.label}`}
            title={`Show ${hero.label}`}
          >
            <span className="portrait-thumb-frame">
              <img src={`${import.meta.env.BASE_URL}${(assetsById[hero.id]?.heroPortrait) || ''}`} alt="" className="portrait-thumb" />
            </span>
          </button>
        );
      })}
    </div>
  );
});

export {PortraitGrid};
