# Citadel Base Styles

A comprehensive web-compatible CSS library converted from the Panorama UI system. All colors, typography, layout utilities, and components are defined as CSS custom properties and standard classes.

## Usage

### Import in your main CSS or JSX file:

```css
@import './styles/citadel-base.css';
```

Or in JSX/JavaScript:

```javascript
import './styles/citadel-base.css';
```

## Quick Reference

### Color Variables

All 150+ colors from the original Panorama system are available as CSS custom properties:

#### Primary Colors
```css
--color-off-white: #ffefd7
--color-off-black: #10130d
--color-silvered: #c6c6c6
```

#### Attribute Colors (Weapon/Armor/Tech)
```css
--color-weapon: #e58a00
--color-weapon-bright: #e58a00
--color-weapon-medium: #c87903
--color-weapon-dark: #7f4f05

--color-armor: #00ff99
--color-armor-bright: #00f794
--color-armor-medium: #00a664
--color-armor-dark: #274c3d

--color-tech: #00ddff
--color-tech-bright: #00ddff
--color-tech-medium: #009bb2
--color-tech-dark: #245359
```

#### Special Attribute Colors
```css
--color-spirit: #8a55b3
--color-spirit-bright: #ce90ff
--color-spirit-dark: #613484
--color-spirit-darker: #362147

--color-courage: #9d620b
--color-courage-bright: #ec9719

--color-fortitude: #649717
--color-fortitude-bright: #7bba1d
```

#### Team Colors
```css
--color-team-1: #bf9a53
--color-team-2: #5b79e6
```

#### Hero Colors
All hero character colors are available (abrams, bookworm, priest, etc.)

### Typography Variables

```css
--font-sans: Retail Demo, Noto Sans, sans-serif
--font-serif: Reaver, serif
--font-block: VALVEPulp, Noto Sans, sans-serif
```

### Typography Classes

```html
<h1 class="h1">Heading 1 - 70px</h1>
<h2 class="h2">Heading 2 - 40px</h2>
<h3 class="h3">Heading 3 - 30px</h3>
<h4 class="h4">Heading 4 - 20px</h4>

<p class="body-lg">Large body text - 26px</p>
<p class="body-md">Medium body text - 18px</p>
<p class="body-sm">Small body text - 18px</p>
<p class="body-xs">Extra small body text - 16px</p>

<span class="uppercase">uppercase text</span>
<span class="silvered">silvered text color</span>
```

### Layout Classes

```html
<!-- Flexbox row layout -->
<div class="left-right-flow">
  <item>Item 1</item>
  <item>Item 2</item>
</div>

<!-- Flexbox column layout -->
<div class="top-bottom-flow">
  <item>Item 1</item>
  <item>Item 2</item>
</div>

<!-- Centering -->
<div class="align-horizontal-center">Centered horizontally</div>
<div class="align-vertical-center">Centered vertically</div>

<!-- Sizing -->
<div class="fill-width">Full width</div>
<div class="fill-height">Full height</div>

<!-- Visibility -->
<div class="hidden">Hidden element</div>
```

### Button Components

#### Primary Button
```html
<button class="PrimaryButton">Click Me</button>
<button class="PrimaryButton dark">Dark Variant</button>
<button class="PrimaryButton" disabled>Disabled</button>
```

#### Secondary Button
```html
<button class="SecondaryButton">Default</button>
<button class="SecondaryButton light">Light Variant</button>
<button class="SecondaryButton dark">Dark Variant</button>
<button class="SecondaryButton green">Green Variant</button>
<button class="SecondaryButton red">Red Variant</button>
```

#### Tertiary Button
```html
<button class="TertiaryButton">Tertiary</button>
<button class="TertiaryButton light">Light</button>
<button class="TertiaryButton dark">Dark</button>
```

#### Link Button
```html
<button class="LinkButton">Link Style Button</button>
```

### Form Elements

```html
<!-- Text Input -->
<input type="text" placeholder="Enter text..." />

<!-- Dropdown/Select -->
<select>
  <option>Option 1</option>
  <option>Option 2</option>
</select>

<!-- Checkbox -->
<input type="checkbox" />

<!-- Radio Button -->
<input type="radio" name="group" />

<!-- Range/Slider -->
<input type="range" />
```

## Using Variables in Your Components

### In CSS:

```css
.MyComponent {
  color: var(--color-off-white);
  background: var(--color-spirit);
  font-family: var(--font-serif);
}

.MyButton:hover {
  background-color: var(--color-weapon-bright);
  border-color: var(--color-courage);
}
```

### In JSX (inline styles):

```jsx
import styles from './MyComponent.module.css';

export function MyComponent() {
  return (
    <div style={{
      color: 'var(--color-off-white)',
      backgroundColor: 'var(--color-spirit)',
    }}>
      Content
    </div>
  );
}
```

## Migration Guide

### From Panorama XML/CSS to Web

| Panorama | Web CSS | Example |
|----------|---------|---------|
| `flow-children: down` | `display: flex; flex-direction: column;` | `.top-bottom-flow` |
| `flow-children: right` | `display: flex; flex-direction: row;` | `.left-right-flow` |
| `horizontal-align: center` | `justify-content: center;` | `.align-horizontal-center` |
| `vertical-align: center` | `align-items: center;` | `.align-vertical-center` |
| `visibility: collapse` | `display: none;` | `.hidden` |
| `@define colorName: value;` | `--color-name: value;` | `:root { --color-spirit: ... }` |
| `colorVariable&opacity` | `rgba(...)` or `opacity` property | See WeaponPanel examples |
| `border-image: url(...)` | `border` + `border-radius` | Standard CSS |

## Panorama Features NOT Included

The following Panorama-specific features were intentionally excluded (no web equivalent):

- `wash-color` - Use `filter: brightness()` or `filter: hue-rotate()`
- `sound:` properties - Use Web Audio API or HTML5 audio
- `transform: translate()` - Use standard CSS `transform`
- `ui-scale` - Use CSS `transform: scale()`
- Custom XML element types - Use HTML + React/Preact
- Server-side stylesheets - Use CSS Modules or standard CSS

## File Structure

```
src/
├── styles/
│   ├── citadel-base.css          ← Main base styles (you are here)
│   └── [component-specific].css  ← Component-specific styles
├── WeaponPanel/
│   ├── WeaponPanel.jsx
│   ├── WeaponPanel.module.css
│   └── WeaponPanelShared.module.css
└── [other components]/
```

## Customization

To override colors in your application:

```css
:root {
  --color-weapon: #ff6600;        /* Change weapon color */
  --color-spirit: #00ff00;        /* Change spirit color */
  --color-off-white: #cccccc;     /* Change base text color */
}
```

Or scope to a specific component:

```css
.MyCustomTheme {
  --color-weapon: #ff6600;
  --color-spirit: #00ff00;
}
```

## Transition Presets

```css
--transition-fast: 0.1s ease-in-out      /* Quick feedback */
--transition-normal: 0.2s ease-in-out    /* Standard animations */
--transition-slow: 0.35s ease-in-out     /* Smooth long transitions */
```

Usage:
```css
.MyElement {
  transition: background-color var(--transition-normal);
}
```

## Z-Index System

```css
--z-dropdown: 1
--z-tooltip: 3
--z-modal: 100
--z-context-menu: 10000100
```

Use these for consistent layering:
```css
.MyDropdown {
  z-index: var(--z-dropdown);
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS custom properties (all modern browsers)
- Flexbox layout (all modern browsers)
- CSS Grid (all modern browsers)

## Notes

- All Panorama-specific syntax has been stripped
- No vendor prefixes needed for modern browsers
- File is minifiable for production
- Tree-shakeable if using CSS-in-JS or CSS modules
