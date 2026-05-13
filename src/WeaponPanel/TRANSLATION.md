# Panorama to Preact + Vite Translation Summary

## Files Created

### Components
- `src/WeaponPanel/WeaponPanel.jsx` - Main component (replaces XML)
- `src/WeaponPanel/index.jsx` - Export
- `src/WeaponPanel/WeaponPanel.example.jsx` - Usage documentation

### Styles (CSS Modules)
- `src/WeaponPanel/WeaponPanel.module.css` - Weapon panel styles
- `src/WeaponPanel/WeaponPanelShared.module.css` - Shared stat styles

## Translation Mappings

### XML → JSX
| Panorama | JSX |
|----------|-----|
| `<CitadelHeroStatsWeapon>` | `<WeaponPanel>` component |
| `<CitadelModifiedAttributeLabel>` | `<label>` or custom component |
| `<CitadelStatScalingLabel>` | Rendered via `hasScaling` prop |
| `<snippets>` | Converted to component functions |
| String tokens like `{s:weapon_name}` | Props passed to component |
| Localization tokens like `#CitadelHeroStats_Weapon` | Hardcoded strings |

### Panorama CSS → Standard CSS
| Panorama | CSS Equivalent |
|----------|----------------|
| `flow-children: down` | `display: flex; flex-direction: column;` |
| `flow-children: right-wrap` | `display: flex; flex-wrap: wrap;` |
| `horizontal-align: right` | `justify-content: flex-end;` |
| `vertical-align: bottom` | `align-items: flex-end;` |
| `ignore-parent-flow: true` | `position: absolute;` |
| `background-size: cover` | `object-fit: cover;` |
| `gradient(linear, 0% 0%, 100% 0%, from(...), to(...))` | `linear-gradient(90deg, color1, color2)` |
| `visibility: collapse` | `display: none;` |
| `text-overflow: shrink` | `text-overflow: ellipsis;` |

### URLs
| Panorama | Web |
|----------|-----|
| `s2r://panorama/images/.../*.vtex` | `/images/.../*.png` or `/*.jpg` |
| `s2r://panorama/styles/*.vcss_c` | CSS Modules `.module.css` |

## CSS Custom Properties (To Define)

Add these to your global CSS or pass via inline styles. Extract from your 3000-line color file:

```css
:root {
  /* Weapon panel colors */
  --color-weapon-primary: #493516;
  --color-weapon-secondary: #271904;
  
  /* Armor panel colors */
  --color-armor-primary: #375B3B;
  --color-armor-secondary: #072F0B;
  
  /* Tech panel colors */
  --color-tech-primary: #653A6D;
  --color-tech-secondary: #452456;
  
  /* Utility colors */
  --color-spirit: #b366cc;
  --color-spirit-dark: rgba(69, 36, 86, 0.31);
  --color-off-black-ee: rgba(0, 0, 0, 0.93);
  --color-off-black-aa: rgba(0, 0, 0, 0.67);
}
```

## What Changed

### Removed (Not Web-Compatible)
- Panorama element types
- Server-side compiled stylesheets
- Source engine binary formats
- Game-specific localization system

### Added (Web Standards)
- Standard HTML/JSX structure
- CSS Flexbox layout
- CSS Modules for scoping
- React/Preact component structure
- Standard image formats

### Preserved
- All visual styling intent
- Layout structure
- Stat display hierarchy
- Hover/active states
- Multi-panel system (weapon/armor/tech)

## Next Steps

1. **Add color definitions** to your global CSS (extract from your 3000-line file)
2. **Replace image URLs** - Update paths in `WeaponPanel.jsx` if needed
3. **Test component** - Use `WeaponPanel.example.jsx` as reference
4. **Adapt stat data** - Structure your stat data to match the `initialStats` prop format
