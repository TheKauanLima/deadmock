import {observer} from 'mobx-react-lite';

import {heroAssets} from '/src/Hero/heroes';

import './PortraitGrid.css';

const PortraitGrid = observer(({state}) => {
  const cols = 8;
  const rows = 5;
  const total = cols * rows;
  const plusIndex = heroAssets.length;
  const cells = Array.from({length: total}, (_, i) => i);

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
              onClick={() => state.clearSelectedHero()}
              aria-label="Show custom background"
              title="Show custom background"
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
              <img src={`${import.meta.env.BASE_URL}${hero.portrait}`} alt="" className="portrait-thumb" />
            </span>
          </button>
        );
      })}
    </div>
  );
});

export {PortraitGrid};
