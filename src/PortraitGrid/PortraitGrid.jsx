import './PortraitGrid.css';
import portraitImage from '/portrait/Abrams_card.png';

const PortraitGrid = () => {
  // 8 columns x 5 rows = 40 slots; leave bottom-right empty
  const cols = 8;
  const rows = 5;
  const total = cols * rows;
  const cells = Array.from({length: total}, (_, i) => i);

  return (
    <div className="portrait-grid" aria-hidden>
      {cells.map((n) => {
        const isLast = n === total - 1; // bottom-right
        return (
          <div key={n} className={`portrait-cell ${isLast ? 'portrait-empty' : ''}`}>
            {!isLast && <img src={portraitImage} alt="" className="portrait-thumb" />}
          </div>
        );
      })}
    </div>
  );
};

export {PortraitGrid};
