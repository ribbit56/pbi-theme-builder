# Power BI Theme Builder — CLAUDE.md

## Project Overview

A polished single-page web app that lets users visually design and export Power BI theme JSON files. Users can upload images to extract dominant colors, build a full color palette with complementary suggestions, choose fonts, preview their theme on a mock dashboard, and export a ready-to-use `.json` file for Power BI Desktop.

---

## Tech Stack

- **Framework**: React (Vite)
- **Styling**: Tailwind CSS + CSS custom properties for theming
- **Color utilities**: `chroma-js` for color math (complementary, analogous, triadic, contrast checking)
- **Image color extraction**: `color-thief-browser` (canvas-based, no server needed)
- **Font loading**: Google Fonts API (dynamic `<link>` injection based on user selection)
- **Icons**: `lucide-react`
- **Export**: Native browser `Blob` + `URL.createObjectURL` for JSON download
- **State**: React `useState` / `useReducer` — no external state library needed yet

---

## Design Principles

- **Aesthetic**: Refined, editorial. Think design tool, not dashboard. Clean panels, generous whitespace, subtle shadows. Not sparse — purposeful density.
- **Light / Dark mode**: Supported via a toggle. Use CSS custom properties (`--bg`, `--surface`, `--text`, etc.) so the entire UI flips cleanly. Persist preference to `localStorage`.
- **Color swatches**: Every color displayed as a swatch tile showing HEX and RGB beneath it. Swatches should be interactive (click to edit, hover for actions).
- **Typography**: Use a refined sans-serif pairing — e.g., `DM Sans` or `Outfit` for UI chrome, `Playfair Display` or `Fraunces` for display headings. Never Inter/Roboto/Arial.
- **No clutter**: Keep the layout to a left panel (controls/palette builder) and a right panel (live mock dashboard preview). No nested modals stacked on modals.

---

## App Structure

```
src/
├── components/
│   ├── ColorSwatch.jsx          # Swatch tile: color block + HEX + RGB + edit/delete actions
│   ├── ColorPicker.jsx          # Inline color picker (native input[type=color] + hex/rgb inputs)
│   ├── ImageUploader.jsx        # Drag-and-drop or click to upload; triggers color extraction
│   ├── PaletteSection.jsx       # Groups swatches by role (Data Colors, Diverging, etc.)
│   ├── ComplementarySuggestions.jsx  # Shows chroma-js computed suggestions as clickable swatches
│   ├── FontSelector.jsx         # Searchable dropdown for Google Fonts; shows live preview
│   ├── ThemePreview.jsx         # Mock Power BI-style dashboard (see below)
│   ├── ExportButton.jsx         # Builds and triggers JSON download
│   └── ThemeToggle.jsx          # Light/Dark mode toggle button
├── hooks/
│   ├── useColorExtraction.js    # Wraps color-thief; returns dominant + palette array
│   ├── useTheme.js              # All theme state: colors, fonts, mode
│   └── useFontLoader.js         # Injects Google Fonts <link> tags dynamically
├── utils/
│   ├── colorHelpers.js          # chroma-js wrappers: toHex, toRgb, getComplementary, getContrast
│   ├── themeBuilder.js          # Assembles the Power BI JSON structure from theme state
│   └── constants.js             # Power BI theme JSON schema keys, default values, font list seed
├── App.jsx
└── main.jsx
```

---

## Power BI Theme JSON Structure

> **Critical**: Power BI Desktop is strict and unforgiving about theme JSON. Malformed files are silently ignored or cause an import error with no useful feedback. `themeBuilder.js` is the single source of truth for JSON assembly — all export logic lives there, nowhere else. Every field must match the schema exactly: correct key names, correct value types, correct nesting. Do not guess at field names or structure — follow the spec below precisely.

### Canonical schema

```json
{
  "name": "My Theme",

  "dataColors": [
    "#118DFF", "#12239E", "#E66C37", "#6B007B",
    "#E044A7", "#744EC2", "#D9B300", "#D64550"
  ],

  "background":   "#FFFFFF",
  "foreground":   "#252423",
  "tableAccent":  "#118DFF",

  "maximum":   "#118DFF",
  "center":    "#FFFFFF",
  "minimum":   "#E66C37",
  "null":      "#8A8886",

  "textClasses": {
    "callout": {
      "fontFace":  "DIN",
      "fontSize":  45,
      "fontColor": "#252423"
    },
    "title": {
      "fontFace":  "DIN",
      "fontSize":  12,
      "fontColor": "#252423"
    },
    "header": {
      "fontFace":  "Segoe UI",
      "fontSize":  12,
      "fontColor": "#252423"
    },
    "label": {
      "fontFace":  "Segoe UI",
      "fontSize":  10,
      "fontColor": "#252423"
    }
  },

  "visualStyles": {
    "*": {
      "*": {
        "background": [{ "color": { "solid": { "color": "#FFFFFF" } } }]
      }
    }
  }
}
```

### Strict field rules — do not deviate

| Rule | Detail |
|---|---|
| **`name`** | Required. String. Power BI shows this in the theme picker UI. |
| **`dataColors`** | Required. Array of exactly **8** hex strings. Fewer than 8 causes PBI to cycle unpredictably; more than 8 are silently ignored. |
| **All hex values** | Must be 6-digit uppercase or lowercase `#RRGGBB`. No shorthand (`#FFF`), no `rgb()`, no `rgba()`, no named colors. Validate before export. |
| **`textClasses` keys** | Must be exactly `callout`, `title`, `header`, `label` — no others. Additional keys are ignored. |
| **`fontFace`** | String. Must exactly match the font name as registered in Windows/Power BI. Google Fonts names are generally safe but must be verified. |
| **`fontSize`** | Number (not string). Integer or float. Do not quote it. |
| **`fontColor`** | Hex string. Same rules as all other hex fields. |
| **`visualStyles` structure** | Deeply nested — the wildcard keys `"*"` are literal strings, not globs in code. The `background` value is an array containing one object; this nesting is mandatory. |
| **`maximum` / `center` / `minimum` / `null`** | Top-level hex strings, not nested objects. |
| **No extra top-level keys** | Power BI ignores unknown keys but do not add anything not in this spec without documenting it explicitly. |
| **No comments in exported JSON** | The final downloaded file must be valid JSON — no `//` or `/* */` comments. Comments in `themeBuilder.js` source are fine. |

### `themeBuilder.js` requirements

- Must be a **pure function**: `buildTheme(state) => plainObject`
- Run the output through a **validation step** before `JSON.stringify`:
  - Assert `dataColors` has exactly 8 entries
  - Assert all color fields match `/^#[0-9A-Fa-f]{6}$/`
  - Assert all `fontSize` values are numbers
  - Throw a descriptive error (caught by `ExportButton.jsx` and shown to the user) if validation fails — never export a broken file silently
- Use `JSON.stringify(themeObject, null, 2)` for readable output
- Export the validator separately as `validateTheme(themeObject)` so it can be unit tested independently

### Reference

Full schema documentation: https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-report-themes

---

## Color Palette Roles

The app should let users assign colors to these named roles (matching Power BI's schema):

| Role | Description |
|---|---|
| `dataColors` | 8 series colors for charts (most important) |
| `background` | Canvas / page background |
| `foreground` | Default text color |
| `tableAccent` | Table header / accent bar |
| `maximum` | Top of diverging scale |
| `center` | Middle of diverging scale |
| `minimum` | Bottom of diverging scale |
| `null` | Null/missing value color |

Show each role with its swatch, label, and an edit button. Don't show all roles at once in a cramped grid — group them logically (Series Colors, Background & Text, Diverging Scale).

---

## Image Upload → Color Extraction Flow

1. User drops or selects an image file (JPG/PNG/WEBP).
2. `color-thief-browser` extracts the dominant color + a palette of 6–8 colors.
3. Display extracted colors as a row of swatches labeled "Extracted from image."
4. Each extracted swatch has an "Add to palette" button (+ icon on hover).
5. Show complementary/analogous suggestions below using `chroma-js`.
6. User clicks to assign extracted/suggested colors to theme roles.

---

## Font Selection

- Provide a searchable dropdown of ~50 curated Google Fonts (not all 1000+).
- Seed list in `constants.js` — include a good mix: geometric sans, humanist sans, slab serifs, elegant serifs, monospace for labels.
- On selection, dynamically inject the Google Fonts `<link>` tag.
- Show a live preview string ("The quick brown fox") in the selected font.
- Users pick fonts for: **Title**, **Header**, **Body/Label**, **Callout** (matching Power BI's `textClasses`).

Suggested curated font list seed:
```
DM Sans, Outfit, Nunito, Raleway, Lato, Source Sans 3,
Merriweather, Lora, Playfair Display, PT Serif,
IBM Plex Mono, JetBrains Mono, Roboto Mono,
Oswald, Barlow Condensed, Work Sans, Cabin, Karla
```

---

## Mock Dashboard Preview (`ThemePreview.jsx`)

Render a simplified Power BI-style dashboard using the selected theme colors and fonts in real time. It does **not** need to be interactive — it's purely visual. Include:

- A **bar chart** (SVG or divs) using `dataColors[0..4]`
- A **line chart** (SVG) using `dataColors[0..2]`
- A **KPI card** showing a big number in `callout` font/color
- A **table** with a header row using `tableAccent`
- **Page background** using `background`
- All labels/titles using the selected fonts and `foreground` color

Keep the mock dashboard contained in the right panel. It should update live as the user changes colors or fonts. Label it clearly as "Preview — not exact Power BI rendering."

---

## Layout

```
┌─────────────────────────────────────────────────────────┐
│  Header: App name + Light/Dark toggle + Export button   │
├──────────────────────┬──────────────────────────────────┤
│  LEFT PANEL          │  RIGHT PANEL                     │
│  - Image Upload      │  Mock Dashboard Preview          │
│  - Extracted Colors  │  (live, updates on change)       │
│  - Complementary     │                                  │
│  - Palette Roles     │                                  │
│  - Font Selection    │                                  │
└──────────────────────┴──────────────────────────────────┘
```

Left panel is scrollable. Right panel is sticky / fixed height. On smaller screens, stack vertically (preview below controls).

---

## Key Behaviors & Constraints

- **No backend** — everything runs client-side. Image processing uses canvas.
- **Export** creates a `.json` file download via `Blob`. Filename defaults to `{theme-name}.json`.
- **Theme name** is editable (text input in header or top of left panel).
- Colors are always validated — if a user types an invalid HEX, show a red outline and don't update state.
- Always maintain **minimum contrast ratio** warning: if `foreground` on `background` is < 4.5:1, show a small warning badge. Use `chroma-js` contrast function.
- The app should ship with a **sensible default theme** so it doesn't look empty on load. Use a clean neutral corporate palette as the default.

---

## Code Style

- Functional components only, no class components.
- Keep components focused — if a component exceeds ~150 lines, split it.
- `themeBuilder.js` is pure (no side effects) — input: state object → output: JSON object.
- Use descriptive variable names; avoid abbreviations in color logic (e.g., `complementaryColors` not `compClrs`).
- CSS custom properties for all theme-aware colors — don't hardcode light/dark variants inside components.
- Comment any non-obvious color math in `colorHelpers.js`.

---

## What NOT to Do

- Don't use a heavy charting library (Recharts, Chart.js) for the mock dashboard — simple SVG is fine and keeps the bundle lean.
- Don't try to perfectly replicate every Power BI visual style — the preview is illustrative, not a pixel-perfect simulator.
- Don't expose the full Google Fonts catalog in the dropdown — curated list only.
- Don't add routing or multiple pages — this is a single-screen tool.
- Don't use a global CSS reset that flattens all styles — scoped Tailwind utilities are fine.
