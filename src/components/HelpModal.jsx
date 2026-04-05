import { X, ImageIcon, Wand2, Sliders, Type, Download, GripVertical, Shuffle, Copy } from 'lucide-react'

const SECTIONS = [
  {
    Icon: ImageIcon,
    title: 'Extract from Image',
    color: '#6366f1',
    steps: [
      'Open the Generate tab and choose Extract from Image.',
      'Drop any image onto the upload zone (photos, brand assets, screenshots — anything works).',
      'Eight dominant colors are pulled from the image and shown as swatches.',
      'Drag swatches to reorder them — the order determines which series color is which in Power BI.',
      'Hit Shuffle to randomize the order, or drag individual swatches into the position you want.',
      'Click Series only to apply just the data colors, or Apply full theme to also update the background, foreground, and accent colors.',
    ],
  },
  {
    Icon: Wand2,
    title: 'Harmony Generator',
    color: '#8b5cf6',
    steps: [
      'Open the Generate tab and choose Harmony Generator.',
      'Click the large color block on the left to pick your seed color.',
      'Choose a harmony rule — Analogous (neighboring hues), Triadic (three evenly spaced), Split-Comp, Tetradic, or Monochromatic.',
      'Eight colors are generated automatically based on the rule.',
      'Drag swatches to reorder them before applying.',
      'Click Apply to series colors to push them into your theme.',
    ],
  },
  {
    Icon: Sliders,
    title: 'Colors',
    color: '#0ea5e9',
    steps: [
      'Manually edit any of the 8 series colors by clicking a swatch — a color picker appears below the row.',
      'Drag swatches to reorder them, or hit the Shuffle button for a random order.',
      'Set Background and Foreground colors to control card and text appearance across your report.',
      'Table Accent drives the header row color in table and matrix visuals.',
      'The Diverging Scale (Min → Center → Max) controls conditional formatting color scales.',
    ],
  },
  {
    Icon: Type,
    title: 'Fonts',
    color: '#f59e0b',
    steps: [
      'Use Apply to all to set one font across every text role in one click.',
      'Fine-tune individual roles: Callout (KPI numbers), Title, Header, and Label.',
      'Only fonts installed locally in Power BI Desktop are supported — the list is pre-filtered to safe choices.',
      'Font size changes are reflected live in the dashboard preview.',
    ],
  },
  {
    Icon: Download,
    title: 'Export',
    color: '#10b981',
    steps: [
      'Check the Raw JSON panel to review the full theme file before downloading.',
      'Click Export JSON in the top-right header to download the .json file.',
      'In Power BI Desktop: View → Themes → Browse for themes → select your downloaded file.',
      'The theme name shown in Power BI matches the name field at the top of the builder.',
    ],
  },
]

const TIPS = [
  { icon: GripVertical, text: 'Drag any color swatch to reorder it — order matters because Power BI assigns series colors in sequence.' },
  { icon: Shuffle,      text: 'Use Shuffle to quickly explore different color orderings without manually dragging.' },
  { icon: Copy,         text: 'Copy any hex code directly from the swatch label with the copy button.' },
]

export default function HelpModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>How to use PBI Theme Builder</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Build and export custom Power BI themes without touching JSON
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:opacity-70 transition-colors"
            style={{ color: 'var(--text-secondary)', background: 'var(--surface)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Workflow overview */}
          <div className="flex items-stretch gap-2">
            {SECTIONS.map(({ Icon, title, color }, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: color + '22' }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <span className="text-[10px] font-semibold text-center leading-tight"
                  style={{ color: 'var(--text-secondary)' }}>{title}</span>
                {i < SECTIONS.length - 1 && (
                  <div className="absolute" /> // spacer handled by gap
                )}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t" style={{ borderColor: 'var(--border)' }} />

          {/* Section details */}
          {SECTIONS.map(({ Icon, title, color, steps }) => (
            <div key={title} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: color + '22' }}>
                  <Icon size={13} style={{ color }} />
                </div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</h3>
              </div>
              <ol className="space-y-1.5 pl-8">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5"
                      style={{ background: color + '22', color }}>
                      {i + 1}
                    </span>
                    <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}

          {/* Tips */}
          <div className="rounded-xl p-4 space-y-2.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Tips</h3>
            {TIPS.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Icon size={13} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{text}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-center pb-1" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
            Preview is approximate — exact rendering depends on your Power BI Desktop version and installed fonts.
          </p>
        </div>
      </div>
    </div>
  )
}
