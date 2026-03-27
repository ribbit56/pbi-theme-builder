# Power BI Theme Builder

A polished, browser-based tool for visually designing and exporting Power BI theme JSON files — no backend required.

![Power BI Theme Builder](public/favicon.svg)

## Features

- **🎨 Visual Palette Editor** — Edit all Power BI theme colour roles (series colours, background, foreground, table accent, diverging scale) with inline colour pickers
- **🖼️ Extract from Image** — Upload any image and automatically extract its dominant colours into your theme
- **🌈 Colour Harmony Generator** — Pick a seed colour and generate a full 8-colour series palette using analogous, complementary, triadic, or split-complementary harmony
- **🔀 Shuffle Series Colours** — Randomise your series palette for quick inspiration
- **🔤 Font Selector** — Choose from fonts known to work in Power BI Desktop (Segoe UI, Calibri, Arial, Aptos, and more)
- **👁️ Live Dashboard Preview** — See your theme applied to a mock Power BI dashboard in real time, with switchable background (white, light grey, black, or custom colour)
- **📋 Raw JSON Panel** — Inspect the exact JSON that will be exported before downloading
- **✅ Validated Export** — Theme JSON is validated before download (hex format, 8 series colours, correct field names) so it imports cleanly into Power BI Desktop every time
- **🌙 Light / Dark Mode** — Full UI theme toggle

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later

### Installation

```bash
git clone https://github.com/ribbit56/pbi-theme-builder.git
cd pbi-theme-builder
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

Output goes to `dist/`.

## How to Use

1. **Start with colours** — Edit the 8 series colours in the palette, or upload a brand image to extract colours automatically
2. **Use the Harmony Generator** — Pick a seed colour and a harmony type to auto-fill all 8 series slots
3. **Set background & text** — Choose your page background, foreground text colour, and table accent
4. **Configure fonts** — Select fonts for title, header, label, and callout text classes
5. **Preview** — Check the live dashboard on the right; toggle the background colour to test against white, grey, or dark canvases
6. **Export** — Click **Export Theme** to download a `.json` file ready to import into Power BI Desktop

### Importing into Power BI Desktop

`View` → `Themes` → `Browse for themes` → select your downloaded `.json` file.

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS + CSS custom properties |
| Colour math | [chroma-js](https://gka.github.io/chroma.js/) |
| Icons | [lucide-react](https://lucide.dev/) |
| Image extraction | Native Canvas API |
| Export | Native `Blob` + `URL.createObjectURL` |

## Project Structure

```
src/
├── components/
│   ├── ColorSwatch.jsx          # Swatch tile with edit/delete actions
│   ├── ColorPicker.jsx          # Inline colour picker
│   ├── ImageUploader.jsx        # Drag-and-drop image upload
│   ├── PaletteSection.jsx       # Full palette editor (series, bg/text, diverging)
│   ├── HarmonyGenerator.jsx     # Colour harmony palette generator
│   ├── ComplementarySuggestions.jsx
│   ├── FontSelector.jsx         # PBI-compatible font dropdown
│   ├── ThemePreview.jsx         # Live mock dashboard preview
│   ├── JsonPanel.jsx            # Raw JSON inspector
│   └── ExportButton.jsx         # Validated JSON export
├── hooks/
│   ├── useColorExtraction.js    # Canvas-based image colour extraction
│   ├── useTheme.js              # All theme state
│   └── useFontLoader.js
├── utils/
│   ├── colorHelpers.js          # chroma-js wrappers
│   ├── colorUtils.js            # Luminance, contrast, palette assignment
│   ├── themeBuilder.js          # Builds & validates Power BI JSON
│   └── constants.js             # Schema keys, defaults, font list
├── App.jsx
└── main.jsx
```

## Power BI Theme JSON

The exported file follows the [official Power BI theme schema](https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-report-themes). Key fields:

```json
{
  "name": "My Theme",
  "dataColors": ["#...", "..."],
  "background": "#FFFFFF",
  "foreground": "#252423",
  "tableAccent": "#118DFF",
  "maximum": "#118DFF",
  "center": "#FFFFFF",
  "minimum": "#E66C37",
  "textClasses": {
    "callout": { "fontFace": "Segoe UI", "fontSize": 45, "color": "#252423" },
    "title":   { "fontFace": "Segoe UI", "fontSize": 12, "color": "#252423" },
    "header":  { "fontFace": "Segoe UI", "fontSize": 12, "color": "#252423" },
    "label":   { "fontFace": "Segoe UI", "fontSize": 10, "color": "#252423" }
  }
}
```

## License

MIT
