export const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/

export const MIN_CONTRAST_RATIO = 4.5

export const DEFAULT_THEME_STATE = {
  name: 'My Theme',
  dataColors: [
    '#118DFF', '#12239E', '#E66C37', '#6B007B',
    '#E044A7', '#744EC2', '#D9B300', '#D64550',
  ],
  background: '#FFFFFF',
  foreground: '#252423',
  tableAccent: '#118DFF',
  maximum: '#118DFF',
  center: '#F2F2F2',
  minimum: '#E66C37',
  null: '#8A8886',
  textClasses: {
    callout: { fontFace: 'Segoe UI', fontSize: 45, fontColor: '#252423' },
    title:   { fontFace: 'Segoe UI', fontSize: 12, fontColor: '#252423' },
    header:  { fontFace: 'Segoe UI', fontSize: 12, fontColor: '#252423' },
    label:   { fontFace: 'Segoe UI', fontSize: 10, fontColor: '#252423' },
  },
}

/**
 * Fonts confirmed to work in Power BI Desktop — all are Windows / Office system fonts.
 * Web/Google fonts are intentionally excluded: PBI ignores fonts not installed locally.
 */
export const FONT_LIST = [
  // Sans-serif (most common in PBI reports)
  { name: 'Segoe UI',               category: 'sans-serif' },
  { name: 'Segoe UI Light',         category: 'sans-serif' },
  { name: 'Segoe UI Semibold',      category: 'sans-serif' },
  { name: 'Aptos',                  category: 'sans-serif' },
  { name: 'Aptos Display',          category: 'sans-serif' },
  { name: 'Arial',                  category: 'sans-serif' },
  { name: 'Calibri',                category: 'sans-serif' },
  { name: 'Calibri Light',          category: 'sans-serif' },
  { name: 'Candara',                category: 'sans-serif' },
  { name: 'Century Gothic',         category: 'sans-serif' },
  { name: 'Corbel',                 category: 'sans-serif' },
  { name: 'Franklin Gothic Medium', category: 'sans-serif' },
  { name: 'Tahoma',                 category: 'sans-serif' },
  { name: 'Trebuchet MS',           category: 'sans-serif' },
  { name: 'Verdana',                category: 'sans-serif' },
  // Serif
  { name: 'Cambria',                category: 'serif' },
  { name: 'Constantia',             category: 'serif' },
  { name: 'Garamond',               category: 'serif' },
  { name: 'Georgia',                category: 'serif' },
  { name: 'Palatino Linotype',      category: 'serif' },
  { name: 'Times New Roman',        category: 'serif' },
  // Monospace
  { name: 'Consolas',               category: 'monospace' },
  { name: 'Courier New',            category: 'monospace' },
  { name: 'Lucida Console',         category: 'monospace' },
]

// Groups for the palette editor UI
export const COLOR_ROLE_GROUPS = [
  {
    id: 'series',
    label: 'Series Colors',
    description: '8 colors used for chart series',
    roles: null, // handled separately (dataColors array)
  },
  {
    id: 'background-text',
    label: 'Background & Text',
    roles: [
      { key: 'background',  label: 'Background' },
      { key: 'foreground',  label: 'Foreground / Text' },
      { key: 'tableAccent', label: 'Table Accent' },
      { key: 'null',        label: 'Null / Missing' },
    ],
  },
  {
    id: 'diverging',
    label: 'Diverging Scale',
    description: 'Min → Center → Max color scale',
    roles: [
      { key: 'minimum', label: 'Minimum' },
      { key: 'center',  label: 'Center' },
      { key: 'maximum', label: 'Maximum' },
    ],
  },
]

export const TEXT_CLASS_LABELS = {
  callout: 'Callout (KPI / big number)',
  title:   'Title',
  header:  'Header',
  label:   'Label / axis',
}
