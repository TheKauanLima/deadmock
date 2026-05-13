import {useState} from 'preact/hooks';
import './SidebarTabs.css';

const SidebarTabs = ({tabs = [], onSelect, defaultActiveId = null}) => {
  const [active, setActive] = useState(defaultActiveId || tabs[0]?.id || null);

  const handleClick = (id) => {
    setActive(id);
    if (onSelect) onSelect(id);
  };

  return (
    <div className="mock-sidebar-tabs" role="tablist" aria-orientation="vertical">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={`mock-sidebar-tab ${active === t.id ? 'active' : ''}`}
          onClick={() => handleClick(t.id)}
          aria-pressed={active === t.id}
          title={t.label}
        >
          {t.icon ? <img src={t.icon} alt="" className="mock-tab-icon"/> : <span className="mock-tab-dot"/>}
        </button>
      ))}
    </div>
  );
};

export default SidebarTabs;
