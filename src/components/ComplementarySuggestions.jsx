import { useState, useMemo } from 'react'
import ColorSwatch from './ColorSwatch.jsx'
import { getComplementary, getAnalogous, getTriadic } from '../utils/colorHelpers.js'

const TABS = ['Complementary', 'Analogous', 'Triadic']

/**
 * Shows chroma-js color suggestions for a given base color.
 * Each swatch can be added to the palette via onColorSelect.
 *
 * Props:
 *   baseColor      — hex string of the color to compute from
 *   onColorSelect  — callback(hex) when a suggested color is chosen
 */
export default function ComplementarySuggestions({ baseColor, onColorSelect }) {
  const [activeTab, setActiveTab] = useState('Complementary')

  const suggestions = useMemo(() => ({
    Complementary: [getComplementary(baseColor)],
    Analogous:     getAnalogous(baseColor, [30, 60, -30, -60]),
    Triadic:       getTriadic(baseColor),
  }), [baseColor])

  const colors = suggestions[activeTab] || []

  return (
    <div className="space-y-3">
      <h3 style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold uppercase tracking-widest">
        Color Suggestions
      </h3>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--surface-2)' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? 'var(--surface)' : 'transparent',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
            className="flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Swatches */}
      <div className="flex gap-3 flex-wrap">
        {colors.map((color, i) => (
          <ColorSwatch
            key={color + i}
            color={color}
            size="sm"
            onAdd={() => onColorSelect(color)}
          />
        ))}
      </div>

      <p style={{ color: 'var(--text-secondary)' }} className="text-xs">
        Click <span className="font-semibold">+</span> on a swatch to assign it to a palette role.
      </p>
    </div>
  )
}
